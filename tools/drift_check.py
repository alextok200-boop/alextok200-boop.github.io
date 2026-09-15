# -*- coding: utf-8 -*-
"""诊断：本地工作区 vs 远端 tree 的差异，并报告本地 git 是否已分叉（shadow repo）。

用法：
    python tools/drift_check.py

三段输出：
  1) 远端 HEAD / tree / blob 数
  2) 本地 git HEAD 与远端 HEAD 的关系（是否分叉）
  3) 逐文件比对：本地受管文件 vs 远端 blob
     · 内容不一致 → ❌ 真缺陷
     · 远端有本地无 → ❌ 真缺陷
     · 本地有远端无 → 分两类：被 .gitignore 忽略的（正常，本地私藏）／未被忽略的（需处理）

⚠️ 判据澄清（踩过的坑）：
   · 不要用「本地 sha 集合 == 远端 sha 集合」当唯一标准 —— 仓库本来就有
     故意不入公网的本地文件（tools/kb-source/ 等敏感原文），必须用 git check-ignore 区分。
   · 不要跳过 downloads/ —— 它是受版本管理的真实目录，跳过会报假缺失。
"""
import os
import sys
import json
import subprocess
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = "alextok200-boop/alextok200-boop.github.io"
BRANCH = "main"


def sh(cmd, env=None):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True,
                       cwd=ROOT, env=env, encoding="utf-8", errors="replace")
    return (r.stdout or "") + (r.stderr or "")


def gh_env():
    env = dict(os.environ)
    env["GH_CONFIG_DIR"] = "C:/Users/alext/AppData/Roaming/GitHub CLI"
    return env


def token():
    return sh("gh auth token", env=gh_env()).strip()


def api(url, tok):
    req = urllib.request.Request(url, headers={
        "Authorization": "Bearer " + tok,
        "Accept": "application/vnd.github+json",
        "User-Agent": "drift-check",
    })
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def remote_tree(tok):
    c = api("https://api.github.com/repos/%s/commits/%s" % (REPO, BRANCH), tok)
    t = api("https://api.github.com/repos/%s/git/trees/%s?recursive=1" % (REPO, c["commit"]["tree"]["sha"]), tok)
    return c, t, {e["path"]: e["sha"] for e in t["tree"] if e["type"] == "blob"}


def local_files():
    """仓库工作区里的候选文件（排除 .git 与本地备份目录）。"""
    out = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        rel = os.path.relpath(dirpath, ROOT).replace("\\", "/")
        rel = "" if rel == "." else rel
        parts = [p for p in rel.split("/") if p]
        if parts and parts[0] == ".git":
            dirnames[:] = []
            continue
        # 本地备份/临时目录不属于受管内容
        dirnames[:] = [d for d in dirnames if not d.startswith(("_backup", "_tmp_"))]
        for fn in filenames:
            out.append(os.path.relpath(os.path.join(dirpath, fn), ROOT).replace("\\", "/"))
    return sorted(out)


def ignored_set():
    """返回被 .gitignore 忽略的路径（含目录形式），以及用于判断的辅助集合。

    ⚠️ 两个坑，都实测踩过：
    1) **别用 `git check-ignore --stdin` + 逐行解析 stdout**：Windows 下
       `subprocess.run(..., input="a\\nb", text=True)` 会把 `\\n` 翻成 `\\r\\n`
       写进子进程 stdin，git 于是把 `\\r` 当成路径的一部分 → stdout 变成
       `"path\\r"`（带引号）→ 逐行匹配全部落空。实测 13 个**已被忽略**的文件
       被误判成「未忽略需处理」，而其中就有 `tools/kb-source/` 的公司敏感原文，
       假阳性可能诱导人去删/去推。**教训：给子进程的 stdin 一律传 bytes。**
    2) `git status --ignored=traditional -uall -z` 是 NUL 分隔、不做引号转义，
       天然免疫空格/中文/CR。用它取忽略集合最稳。
    """
    r = subprocess.run(
        ["git", "status", "--porcelain", "--ignored=traditional", "-uall", "-z"],
        cwd=ROOT, capture_output=True)
    ign = set()
    for rec in r.stdout.decode("utf-8", "replace").split("\x00"):
        if rec.startswith("!! "):
            ign.add(rec[3:])
    return ign


def is_ignored(path, ign):
    """路径本身或其任一父目录被忽略，都算被忽略。"""
    if path in ign:
        return True
    parts = path.split("/")
    for i in range(1, len(parts)):
        if "/".join(parts[:i]) in ign:
            return True
    return False


def blob_sha(paths):
    """git hash-object --stdin-paths --no-filters 批量取内容 sha。

    ⚠️ `--no-filters`：仓库开 autocrlf/filter 时，不加会把换行转换后的 sha 当结果，
       与远端内容寻址 sha 不等 → 凭空多出一批「已修改」假差异。
    ⚠️ stdin 必须传 bytes（见 ignored_set 的坑 1）。
    """
    payload = ("\n".join(paths) + "\n").encode("utf-8")
    r = subprocess.run(["git", "hash-object", "--stdin-paths", "--no-filters"],
                       input=payload, cwd=ROOT, capture_output=True)
    return [l.strip() for l in r.stdout.decode("utf-8", "replace").splitlines() if l.strip()]


def main():
    tok = token()
    if not tok:
        print("ERROR: 无法获取 GitHub token")
        return 1
    commit, tree, rb = remote_tree(tok)
    print("=== 1) 远端 ===")
    print("HEAD   %s  %s" % (commit["sha"][:7], commit["commit"]["message"].splitlines()[0][:60]))
    print("tree   %s   blobs=%d  truncated=%s"
          % (commit["commit"]["tree"]["sha"][:8], len(rb), tree.get("truncated")))

    print()
    print("=== 2) 本地 git 与远端关系 ===")
    local_head = sh("git rev-parse HEAD").strip()
    local_tree = sh("git rev-parse HEAD^{tree}").strip()
    exists = sh("git cat-file -t %s" % commit["sha"]).strip() == "commit"
    print("local HEAD  %s" % local_head[:7])
    print("local tree  %s" % local_tree[:8])
    print("远端 HEAD 对象本地存在？ %s" % ("是" if exists else "否"))
    if local_head == commit["sha"]:
        print("=> ✅ 本地 HEAD == 远端 HEAD，未分叉")
    elif exists and local_tree == commit["commit"]["tree"]["sha"]:
        print("=> ✅ 本地树与远端一致（HEAD 指向不同提交但内容相同）")
    else:
        print("=> ❌ 本地已分叉 / 落后（shadow repo）：本地 %s 个提交，请跑 tools/sync_local.py 对齐"
              % sh("git rev-list --count HEAD").strip())

    print()
    print("=== 3) 内容比对（本地工作区 vs 远端 tree）===")
    acr = sh("git config --get core.autocrlf").strip()
    if acr and acr.lower() != "false":
        print("⚠️ core.autocrlf=%s —— 工作区文本可能被检出成 CRLF 而仓库存 LF，"
              "会让下面的 sha 比对产生大量**假差异**。" % acr)
        print("   先跑 `git config core.autocrlf false` 并把文本文件回正为 LF 再解读结果。")
        print()
    lf = local_files()
    shas = blob_sha(lf)
    if len(shas) != len(lf):
        print("❌ hash-object 行数 %d != 文件数 %d" % (len(shas), len(lf)))
        return 1
    local = dict(zip(lf, shas))
    ign = ignored_set()

    missing = sorted(set(rb) - set(local))
    extra_raw = sorted(set(local) - set(rb))
    extra_ign = [p for p in extra_raw if is_ignored(p, ign)]
    extra_bad = [p for p in extra_raw if not is_ignored(p, ign)]
    diff = sorted(p for p in (set(local) & set(rb)) if local[p] != rb[p])

    print("本地文件 %d / 远端 blob %d" % (len(local), len(rb)))
    print("内容不一致（本地≠远端） %d" % len(diff))
    for p in diff[:40]:
        print("   ~ %s" % p)
    print("远端有本地无（缺失） %d" % len(missing))
    for p in missing[:40]:
        print("   - %s" % p)
    print("本地有远端无（已 .gitignore，正常私藏） %d" % len(extra_ign))
    for p in extra_ign[:40]:
        print("   i %s" % p)
    print("本地有远端无（未被忽略，需处理） %d" % len(extra_bad))
    for p in extra_bad[:40]:
        print("   + %s" % p)

    hard_ok = not missing and not diff
    print()
    print("内容一致性（缺失/不一致）:", "PASS ✅" if hard_ok else "FAIL ❌")
    print("未忽略的多余文件        :", "0 ✅" if not extra_bad else "%d ⚠️" % len(extra_bad))
    return 0 if (hard_ok and not extra_bad) else 2


if __name__ == "__main__":
    sys.exit(main())
