# -*- coding: utf-8 -*-
"""把本地 git 对齐到远端分支头（走 api.github.com，不依赖 git fetch）。

为什么需要它
------------
本机 `github.com:443` 常被网络层拦截（`git fetch/push` 报 SSL unexpected eof /
CONNECT 502），于是推送改走 **Git Data API**（见同目录 apipush.py）。
但 API 推送**不会回写本地 git** → 本地历史与远端分叉，变成「影子仓库」：
  · `git log` 看不到真实版本；
  · `git pull` 必然冲突；
  · 本地不能当作回滚点。
凡做过 API 推送、或在别的机器推过、或不确定本地是否落后 —— 跑这个脚本。

它做什么
--------
1. 走 API 取远端分支头 SHA；
2. 在本地**重建**同 SHA 的 commit / tree / blob 对象（按需补齐，不整仓下载）；
3. `git reset --hard <远端SHA>` 对齐；
4. 复核 HEAD、tree、内容一致性。

⚠️ 铁律：凡走 Git Data API 推送，推送后必须跑一次本脚本。
⚠️ `git reset --hard` 会丢弃未提交改动。默认先打包备份到仓库同级 _backup/，
   工作区脏且未加 --force 时**只备份、不对齐**（不丢东西）。

用法
----
    python tools/sync_local.py                 # 备份 + 对齐 + 校验
    python tools/sync_local.py --check         # 只看差多少，不动任何文件
    python tools/sync_local.py --force         # 确认丢弃未提交改动，强制对齐
    python tools/sync_local.py --repo o/r --branch main
    python tools/sync_local.py --no-backup     # 跳过备份（已备份过时用）

退出码：0 = 已对齐；1 = 出错或需人工确认；2 = --check 且本地落后
"""
from __future__ import print_function

import argparse
import base64
import calendar
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
import zipfile

API = "https://api.github.com"
BACKUP_DIRNAME = "_backup"


# --------------------------------------------------------------------------
# 基础
# --------------------------------------------------------------------------
def run(args, cwd=None, stdin=None, env=None, binary=False):
    return subprocess.run(args, cwd=cwd, input=stdin, capture_output=True,
                          text=not binary,
                          encoding=None if binary else "utf-8",
                          errors=None if binary else "replace", env=env)


def repo_root():
    p = run(["git", "rev-parse", "--show-toplevel"])
    if p.returncode != 0:
        raise SystemExit("当前目录不是 git 仓库")
    return p.stdout.strip()


def detect_repo(root):
    """从 origin 远端地址推断 owner/repo，支持 https 与 ssh 两种写法。"""
    p = run(["git", "remote", "get-url", "origin"], cwd=root)
    url = (p.stdout or "").strip()
    m = re.search(r"github\.com[:/]+([^/]+)/([^/\s]+?)(?:\.git)?$", url)
    if not m:
        raise SystemExit("无法从 origin 推断仓库：%r（请用 --repo owner/repo）" % url)
    return "%s/%s" % (m.group(1), m.group(2))


def get_token():
    """按优先级取 token：环境变量 → gh CLI → git 凭据管理器。不打印、不落盘。"""
    for var in ("GH_TOKEN", "GITHUB_TOKEN"):
        if os.environ.get(var):
            return os.environ[var].strip()
    env = dict(os.environ)
    env.setdefault("GH_CONFIG_DIR", os.path.expanduser("~/.config/gh"))
    p = run(["gh", "auth", "token"], env=env)
    if p.returncode == 0 and (p.stdout or "").strip():
        return p.stdout.strip()
    env2 = dict(os.environ, GIT_TERMINAL_PROMPT="0", GCM_INTERACTIVE="never")
    p = run(["git", "credential", "fill"],
            stdin="protocol=https\nhost=github.com\n\n", env=env2)
    for line in (p.stdout or "").splitlines():
        if line.startswith("password="):
            return line[len("password="):]
    raise SystemExit("取不到 GitHub token（GH_TOKEN / gh auth / git credential 都没命中）")


def api_get(path, token, attempts=5):
    """GET api.github.com（JSON）；抖动/截断时指数退避重试。"""
    last = None
    for i in range(attempts):
        req = urllib.request.Request(
            API + path,
            headers={"Authorization": "Bearer " + token,
                     "Accept": "application/vnd.github+json",
                     "X-GitHub-Api-Version": "2022-11-28",
                     "User-Agent": "sync-local"})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                want = r.headers.get("Content-Length")
                raw = r.read()
                # ⚠️ 本机网络对 ~1MB 响应会 IncompleteRead（实测 862490/904553）。
                #    不要只依赖 read() 抛异常 —— 显式比对 Content-Length 才可靠。
                if want is not None and len(raw) != int(want):
                    raise IOError("短读 %d/%s" % (len(raw), want))
                return json.loads(raw.decode("utf-8"))
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", "replace")[:200]
            if e.code in (429, 500, 502, 503, 504) and i < attempts - 1:
                last = "HTTP %s" % e.code
            else:
                raise SystemExit("api.github.com 返回 %s：%s" % (e.code, body))
        except Exception as e:  # noqa: BLE001
            last = "%s: %s" % (type(e).__name__, e)
        if i < attempts - 1:
            time.sleep(2 * (i + 1))
    raise SystemExit("api.github.com 不可达（%s）。先解决网络再试。" % last)


def api_raw(path, token, attempts=6):
    """按原始字节下载（用于 blob）。

    ⚠️ 用 `Accept: application/vnd.github.raw` 而不是默认 JSON：JSON 会把内容
       base64 一遍，体积膨胀 33%，而本机网络恰好在 ~1MB 附近容易截断。
    """
    last = None
    for i in range(attempts):
        req = urllib.request.Request(
            API + path,
            headers={"Authorization": "Bearer " + token,
                     "Accept": "application/vnd.github.raw",
                     "X-GitHub-Api-Version": "2022-11-28",
                     "User-Agent": "sync-local"})
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                want = r.headers.get("Content-Length")
                data = r.read()
                if want is not None and len(data) != int(want):
                    raise IOError("短读 %d/%s" % (len(data), want))
                return data
        except Exception as e:  # noqa: BLE001
            last = "%s: %s" % (type(e).__name__, e)
        if i < attempts - 1:
            time.sleep(2 * (i + 1))
    print("# blob %s 直连下载失败（%s），改走 base64 通路" % (path.rsplit("/", 1)[-1][:8], last),
          file=sys.stderr)
    return None


def api_blob_bytes(repo, sha, token):
    """取 blob 内容：先 raw，失败再退回 base64 JSON（两路互备）。"""
    data = api_raw("/repos/%s/git/blobs/%s" % (repo, sha), token)
    if data is not None:
        return data
    info = api_get("/repos/%s/git/blobs/%s" % (repo, sha), token)
    return base64.b64decode(info["content"])


# --------------------------------------------------------------------------
# 对象写入：先在 Python 里算 sha，命中才落盘（省掉上千次 git 进程）
# --------------------------------------------------------------------------
def git_sha(obj_type, body):
    """复算 git 对象 sha：sha1("<type> <len>\\0" + body)。"""
    header = ("%s %d\x00" % (obj_type, len(body))).encode("utf-8")
    return hashlib.sha1(header + body).hexdigest()


def write_object(root, obj_type, body, expect):
    """校验 sha 一致后把对象写进本地库。body 必须是 bytes（文本模式会毁内容）。"""
    got = git_sha(obj_type, body)
    if got != expect:
        raise SystemExit("%s 重建失败：期望 %s 得到 %s" % (obj_type, expect[:8], got[:8]))
    p = subprocess.run(["git", "hash-object", "-t", obj_type, "-w", "--stdin"],
                       cwd=root, input=body, capture_output=True)
    if p.returncode != 0:
        raise SystemExit("写入 %s 被 git 拒绝：%s"
                         % (obj_type, p.stderr.decode("utf-8", "replace").strip()))


def obj_exists(root, sha):
    return run(["git", "cat-file", "-e", sha], cwd=root).returncode == 0


class Stats(object):
    def __init__(self):
        self.blobs = 0      # 从 API 下载的 blob
        self.local = 0      # 用本地工作区文件回填的 blob（零网络）
        self.trees = 0
        self.commits = 0


def local_file_sha(root, rel):
    """算本地工作区某路径的 blob sha；文件不存在返回 None。

    ⚠️ 必须 `--no-filters`：仓库开了换行/过滤器时，不加会把 sha 算成换行转换后的结果，
       与 GitHub 的内容寻址 sha 不等 —— 会凭空多出一批「内容不一致」的假差异。
    """
    p = os.path.join(root, rel.replace("/", os.sep))
    if not os.path.isfile(p):
        return None
    r = run(["git", "hash-object", "--no-filters", "--", p], cwd=root, binary=True)
    if r.returncode != 0:
        return None
    return r.stdout.decode("utf-8", "replace").strip()


def ensure_blob(root, repo, rel, sha, token, st):
    """确保该 blob 在本地存在。

    优先用本地工作区同名文件回填 —— 内容寻址的 sha 相等即**逐字节相同**，
    等价于下载，但是零网络。这一步让「本地内容已与远端一致」的场景几乎不需要
    下载任何 blob（实测本仓库 157 个 blob / 8.81 MB 中有大量 700KB+ 的 PNG）。

    ⚠️ 为什么要这么绕：本机对 api.github.com 的 **大响应（>~700KB）会间歇性
       截断**（IncompleteRead），而 raw.githubusercontent.com 被网络层直接阻断
       （RemoteDisconnected）。硬下 6.7MB 的截图必然反复失败。
    """
    if obj_exists(root, sha):
        return
    if local_file_sha(root, rel) == sha:
        r = run(["git", "hash-object", "-w", "--no-filters", "--",
                 os.path.join(root, rel.replace("/", os.sep))], cwd=root, binary=True)
        if r.returncode == 0 and obj_exists(root, sha):
            st.local += 1
            if st.local % 25 == 0:
                print("    …已用本地文件回填 %d 个 blob" % st.local, flush=True)
            return
    write_object(root, "blob", api_blob_bytes(repo, sha, token), sha)
    st.blobs += 1
    if st.blobs % 25 == 0:
        print("    …已下载 %d 个 blob" % st.blobs, flush=True)


def ensure_tree(root, repo, sha, token, st, seen=None, prefix=""):
    """递归补齐树闭包。GitHub 的 trees 接口一次只返回一层。

    ⚠️ 必须一路把 prefix 带下去：子树的 path 是**相对父树**的，只有拼出仓库内
       全路径才能拿它去工作区找同名文件回填 blob。
    """
    seen = seen if seen is not None else set()
    if sha in seen or obj_exists(root, sha):
        return
    seen.add(sha)
    data = api_get("/repos/%s/git/trees/%s" % (repo, sha), token)
    entries = []
    for e in data.get("tree", []):
        full = (prefix + "/" + e["path"]) if prefix else e["path"]
        if e["type"] == "tree":
            ensure_tree(root, repo, e["sha"], token, st, seen, full)
        elif e["type"] == "blob":
            ensure_blob(root, repo, full, e["sha"], token, st)
        # 模式串必须去零填充：API 给 "040000"，git 树规范是 "40000"，
        # 原样写回会被判 zeroPaddedFilemode（fsck 不过）。
        mode = e["mode"].lstrip("0") or "0"
        entries.append((mode, e["path"], bytes.fromhex(e["sha"])))
    # git 树条目排序：目录按「名字 + /」参与比较
    entries.sort(key=lambda x: (x[1] + "/") if x[0] == "40000" else x[1])
    body = b"".join(m.encode() + b" " + n.encode("utf-8") + b"\x00" + r
                    for m, n, r in entries)
    write_object(root, "tree", body, sha)
    st.trees += 1


def rebuild_commit(root, repo, d, sha, token, st):
    """在本地重建与远端逐位相同的 commit 对象。

    时区不猜：GitHub 的 date 是 UTC（...Z），而 commit 对象里存作者本地偏移，
    穷举常见偏移 + 尾部换行两种组合，复算命中即停（纯 Python，几乎零成本）。
    """
    tree = d["tree"]["sha"]
    parents = d.get("parents") or []
    parent = parents[0]["sha"] if parents else None
    ensure_tree(root, repo, tree, token, st)

    ts = calendar.timegm(time.strptime(d["author"]["date"], "%Y-%m-%dT%H:%M:%SZ"))
    tzs = ["%+03d%02d" % (h, m) for h in range(-14, 15) for m in (0, 30, 45)]
    for tz in tzs:
        for msg in (d["message"], d["message"] + "\n"):
            body = ("tree %s\n%s"
                    "author %s <%s> %d %s\n"
                    "committer %s <%s> %d %s\n\n%s" % (
                        tree,
                        ("parent %s\n" % parent) if parent else "",
                        d["author"]["name"], d["author"]["email"], ts, tz,
                        d["committer"]["name"], d["committer"]["email"], ts, tz, msg))
            raw = body.encode("utf-8")
            if git_sha("commit", raw) == sha:
                write_object(root, "commit", raw, sha)
                return tz
    raise SystemExit("commit 重建失败 %s（远端可能用了非常见时区）" % sha[:8])


def local_parents(root, sha):
    p = run(["git", "cat-file", "-p", sha], cwd=root)
    if p.returncode != 0:
        return None
    return [ln.split()[1] for ln in p.stdout.splitlines() if ln.startswith("parent ")]


def local_tree(root, sha):
    p = run(["git", "cat-file", "-p", sha], cwd=root)
    if p.returncode != 0:
        return None
    for ln in p.stdout.splitlines():
        if ln.startswith("tree "):
            return ln.split()[1]
    return None


def ensure_chain(root, repo, sha, token, st, maxn=2000):
    """从目标 commit 逐级上溯补齐，直到整条链在本地完整。

    ⚠️ 不能「目标已存在就跳过」：「目标在、祖先缺」的断链会让 `git log` 静默空输出。
       本地已存在的 commit 也要继续上溯（读本地对象，零 API 成本），并校验它的
       tree 是否在本地 —— 只补 commit 不补 tree 会留下「git log 能看、git status
       报 bad tree object」的半残状态。
    """
    seen = set()
    stack = [sha]
    print("    目标 commit %s，开始逐级补齐…" % sha[:8], flush=True)
    while stack:
        if len(seen) >= maxn:
            raise SystemExit("上溯超过 %d 个提交，疑似历史异常，已中止" % maxn)
        s = stack.pop()
        if s in seen:
            continue
        seen.add(s)
        ps = local_parents(root, s)
        if ps is not None:
            t = local_tree(root, s)
            if t and not obj_exists(root, t):
                print("# commit %s 本地已有但 tree %s 缺失，补齐中" % (s[:8], t[:8]),
                      file=sys.stderr)
                ensure_tree(root, repo, t, token, st)
            stack.extend(ps)
            continue
        info = api_get("/repos/%s/commits/%s" % (repo, s), token)
        c = info["commit"]
        meta = {"tree": c["tree"], "author": c["author"], "committer": c["committer"],
                "message": c["message"], "parents": info.get("parents") or []}
        rebuild_commit(root, repo, meta, s, token, st)
        st.commits += 1
        for p in meta["parents"]:
            stack.append(p["sha"])


# --------------------------------------------------------------------------
# 备份
# --------------------------------------------------------------------------
def backup(root, stamp):
    parent = os.path.dirname(root)
    out_dir = os.path.join(parent, BACKUP_DIRNAME)
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, "%s-presync-%s.zip" % (os.path.basename(root), stamp))
    n = 0
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for dirpath, dirnames, filenames in os.walk(root):
            rel = os.path.relpath(dirpath, root)
            parts = [p for p in ([] if rel == "." else rel.split(os.sep)) if p]
            if parts and parts[0] == ".git":
                dirnames[:] = []
                continue
            for fn in filenames:
                p = os.path.join(dirpath, fn)
                arc = os.path.relpath(p, root).replace("\\", "/")
                try:
                    z.write(p, arc)
                    n += 1
                except OSError as e:
                    print("  ! 跳过 %s (%s)" % (arc, e))
    print("✅ 备份 %d 个文件 → %s (%.1f MB)" % (n, out, os.path.getsize(out) / 1048576.0))
    return out


# --------------------------------------------------------------------------
# 主流程
# --------------------------------------------------------------------------
def dirty_split(root):
    """把工作区改动分成「受版本管理」与「未跟踪」两类。

    ⚠️ 别把 `??` 也算成危险改动：`git reset --hard` **不动未跟踪文件**。
       而「刚用 API 推了新文件、本地那份还是未跟踪」正是本脚本最常见的用法，
       一刀切会让它在该干活的时候拒绝干活（实测踩到）。
       真正会被 reset 丢弃的只有受版本管理文件的改动/删除。
    """
    out = run(["git", "status", "--porcelain", "-z"], cwd=root).stdout
    tracked, untracked = [], []
    for rec in out.split("\x00"):
        if not rec:
            continue
        code, _, path = rec.partition(" ")
        (untracked if code == "??" else tracked).append("%s %s" % (code, path))
    return tracked, untracked


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=None, help="owner/repo（默认从 origin 推断）")
    ap.add_argument("--branch", default="main")
    ap.add_argument("--check", action="store_true", help="只报告差异，不动任何文件")
    ap.add_argument("--force", action="store_true", help="工作区脏时仍强制对齐")
    ap.add_argument("--no-backup", action="store_true", help="跳过备份")
    args = ap.parse_args()

    root = repo_root()
    repo = args.repo or detect_repo(root)
    token = get_token()
    info = api_get("/repos/%s/commits/%s" % (repo, args.branch), token)
    target = info["sha"]
    target_tree = info["commit"]["tree"]["sha"]

    local = run(["git", "rev-parse", "HEAD"], cwd=root).stdout.strip()
    print("▶ 仓库 %s" % root)
    print("  远端 %s/%s  %s  %s" % (repo, args.branch, target[:8],
                                info["commit"]["message"].splitlines()[0][:52]))
    print("  本地 HEAD    %s" % local[:8])

    if local == target:
        tracked, untracked = dirty_split(root)
        if not tracked and not untracked:
            print("✅ 本地已与远端一致，工作区干净。")
            return 0
        print("✅ 本地已与远端一致。")
        if tracked:
            print("⚠️ 有受版本管理文件的未提交改动：")
            for ln in tracked:
                print("   " + ln)
        if untracked:
            print("ℹ️ 未跟踪文件（reset 不会动它们）：")
            for ln in untracked:
                print("   " + ln)
        return 0

    # 落后/领先计数（对象不全时 rev-list 会失败，视为未知）
    behind = run(["git", "rev-list", "--count", "%s..%s" % (local, target)], cwd=root)
    ahead = run(["git", "rev-list", "--count", "%s..%s" % (target, local)], cwd=root)
    behind_s = behind.stdout.strip() if behind.returncode == 0 else "?"
    ahead_s = ahead.stdout.strip() if ahead.returncode == 0 else "?"
    print("  落后 %s 个提交，领先 %s 个提交（? = 远端对象本地缺失，属正常）" % (behind_s, ahead_s))

    if args.check:
        print("ℹ --check：未改动任何文件。去掉 --check 即执行对齐。")
        return 2 if local != target else 0

    tracked, untracked = dirty_split(root)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    if untracked:
        print("ℹ️ 未跟踪文件 %d 个（reset 不会动它们，无需处理）：" % len(untracked))
        for ln in untracked[:10]:
            print("   " + ln)
    if tracked:
        if not args.no_backup:
            backup(root, stamp)
        if not args.force:
            print("⚠️ 有受版本管理文件的未提交改动（对齐会丢弃）：")
            for ln in tracked:
                print("   " + ln)
            print("✗ 已停下，未改动任何文件。要保留请先提交；要丢弃加 --force。")
            return 1
        print("  --force：丢弃上述未提交改动，继续对齐")

    # 留一个可回退的 tag（本地旧历史退到 reflog 后仍可取回）
    tag = "presync-local-%s" % stamp
    r = run(["git", "tag", "-f", tag, local], cwd=root)
    print("▶ 旧 HEAD 已打 tag：%s（%s）" % (tag, "ok" if r.returncode == 0 else "失败，忽略"))

    print("▶ 重建远端对象链…")
    st = Stats()
    ensure_chain(root, repo, target, token, st)
    print("  补齐 %d commit / %d tree / %d blob（其中 %d 个由本地文件回填，%d 个走下载）"
          % (st.commits, st.trees, st.blobs + st.local, st.local, st.blobs))

    if run(["git", "cat-file", "-t", target], cwd=root).stdout.strip() != "commit":
        print("✗ 目标 commit 本地仍不存在，中止（工作区未改动）")
        return 1

    print("▶ reset --hard %s" % target[:8])
    r = run(["git", "reset", "--hard", target], cwd=root)
    if r.returncode != 0:
        print("✗ reset 失败：%s" % (r.stderr or "").strip())
        return 1

    now = run(["git", "rev-parse", "HEAD"], cwd=root).stdout.strip()
    tree = run(["git", "rev-parse", "HEAD^{tree}"], cwd=root).stdout.strip()
    cnt = run(["git", "rev-list", "--count", "HEAD"], cwd=root).stdout.strip()
    ok = (now == target) and (tree == target_tree)
    print()
    print("  本地新 HEAD %s" % now[:8])
    print("  tree        %s" % tree[:8])
    print("  远端 tree   %s" % target_tree[:8])
    print("  提交数      %s" % cnt)
    print("✅ 已对齐远端" if ok else "❌ 对齐后校验不一致，请检查")
    print()
    print("--- git status --porcelain ---")
    print(run(["git", "status", "--porcelain"], cwd=root).stdout.rstrip() or "(clean)")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
