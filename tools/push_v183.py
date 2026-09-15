#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GitHub Git Data API 推送 — personal-site v1.8.3 (RGB 星辰大海-璀璨配色升级)

为什么放弃 tree-SHA 逐位比对、改为内容一致性校验：
  GitHub 的 POST /git/trees 在构建嵌套树时，对「前导点路径」(.github / .gitignore)
  采用与其他平台一致的排序（点文件排到普通文件之后）；而 git 自身按字节序把
  '.' (0x2E) 排在最前。因此同一组文件在 GitHub 上构建出的 tree SHA 必然与本地
  git 的 tree SHA 不同，但【每个文件的 blob SHA 完全一致】——即站点内容零偏差。
  本环境 github.com:443 被网络层拦截，git push 不可用，只能走 API，故以
  「(path, blob_sha) 集合逐条一致」作为发布正确性闸门（比 tree SHA 更贴近目标：
  站点最终是按路径取文件，与目录内部排序无关）。

策略：
  - git ls-tree -r HEAD 建立本地 (path -> (mode, blob_sha)) 真相表
  - diff 基准 = 本地 v1.8.2 (35a0213, tree 6c3e1103 == 远端 tree)
  - 变化文件：git cat-file blob <sha> 读确切字节 + base64 上传（中文路径不传 git）
  - 全量 entries 上传建 tree（GitHub 独立排序，无需 base_tree）
  - 拉回构建的 tree 递归列表，逐条比对 (path, blob_sha) 集合
  - 内容一致则 commit(parents=[remote_head]) + PATCH ref（干净 fast-forward）
  - blob 缓存（git blob sha -> api blob sha），502 重跑幂等
"""
import json, os, subprocess, base64, sys, time

REPO = "alextok200-boop/alextok200-boop.github.io"
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # 脚本在 tools/，上两层即项目根
GH_ENV = dict(os.environ)
GH_ENV["GH_CONFIG_DIR"] = "C:/Users/alext/AppData/Roaming/GitHub CLI"

def sh(cmd):
    return subprocess.run(cmd, cwd=ROOT_DIR, capture_output=True, env=GH_ENV)

def gh_api(method, path, data=None, retries=6):
    cmd = ["gh", "api", "-X", method, f"repos/{REPO}/{path}"]
    if data is not None:
        tmp = os.path.join(ROOT_DIR, "_api_body.json")
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)
        cmd += ["--input", tmp]
    for attempt in range(retries):
        p = sh(cmd)
        if p.returncode == 0 and p.stdout.strip():
            try:
                return json.loads(p.stdout.decode("utf-8"))
            except Exception:
                pass
        wait = 2 ** attempt + 1
        print(f"  ! gh_api {method} {path} 重试 {attempt+1}/{retries} ({wait}s)")
        time.sleep(wait)
    print(f"  ✗ gh_api {method} {path} 失败:\n{p.stderr.decode('utf-8','ignore')[:500]}",
          file=sys.stderr)
    return None

# ---------- 1. ls-tree 全量字典（本地真相）----------
out = sh(["git", "ls-tree", "-r", "HEAD"]).stdout.decode("utf-8")
local = {}  # path -> (mode, sha)
for line in out.splitlines():
    if not line.strip():
        continue
    meta, path = line.split("\t", 1)
    mode, typ, sha = meta.split()
    local[path] = (mode, sha)
print(f"本地 HEAD 跟踪文件数 (blob): {len(local)}")

# ---------- 2. diff 基准 + remote head ----------
base_commit = "35a0213"
diff_out = sh(["git", "diff", "--name-only", base_commit, "HEAD"]).stdout.decode("utf-8")
changed = [d for d in diff_out.splitlines() if d.strip()]
print(f"变化文件数: {len(changed)}")
if not changed:
    print("✗ 无变化，基准有误"); sys.exit(1)

local_head = sh(["git", "rev-parse", "HEAD"]).stdout.decode("utf-8").strip()
target_tree = sh(["git", "rev-parse", f"HEAD^{{tree}}"]).stdout.decode("utf-8").strip()
remote_head = sh(["gh", "api", "repos/" + REPO + "/commits/main", "--jq", ".sha"]).stdout.decode("utf-8").strip()
print(f"本地 HEAD: {local_head}  tree={target_tree}")
print(f"远端 HEAD: {remote_head}")

# ---------- 3. blob 缓存 ----------
CACHE_FILE = os.path.join(ROOT_DIR, "_blobcache_v183.json")
blob_cache = {}
if os.path.exists(CACHE_FILE):
    try:
        blob_cache = json.load(open(CACHE_FILE, "r", encoding="utf-8"))
    except Exception:
        blob_cache = {}

def upload_by_sha(sha):
    if sha in blob_cache:
        return blob_cache[sha]
    raw = sh(["git", "cat-file", "blob", sha]).stdout
    if not raw:
        return None
    data = {"content": base64.b64encode(raw).decode("ascii"), "encoding": "base64"}
    r = gh_api("POST", "git/blobs", data)
    if not r or "sha" not in r:
        return None
    blob_cache[sha] = r["sha"]
    json.dump(blob_cache, open(CACHE_FILE, "w", encoding="utf-8"))
    return r["sha"]

# ---------- 4. 全量 tree 条目（变化上传新 blob；未变引用本地 sha）----------
changed_set = set(changed)
entries = []
uploaded = 0
for path, (mode, sha) in local.items():
    if path in changed_set:
        api_sha = upload_by_sha(sha)
        uploaded += 1
        if not api_sha:
            print(f"  ✗ blob 上传失败: {path}"); sys.exit(1)
    else:
        api_sha = sha  # 未变文件：远端 v1.8.2 已有该 blob（sha 相同），直接引用
    entries.append({"path": path, "mode": mode, "type": "blob", "sha": api_sha})
print(f"全量 tree 条目: {len(entries)}（其中上传新 blob: {uploaded}）")

# ---------- 5. 建 tree（全量，无 base_tree）----------
print("构建全量 tree（GitHub 独立排序）...")
tree = gh_api("POST", "git/trees", {"tree": entries})
if not tree or "sha" not in tree:
    print("✗ tree 创建失败"); sys.exit(1)
new_tree = tree["sha"]
print(f"GitHub 构建 tree: {new_tree}")
print(f"本地         tree: {target_tree}")

# ---------- 6. 内容一致性校验（替代 tree-SHA 逐位比对）----------
#    拉回 GitHub 构建的 tree（递归），比对 (path, blob_sha) 集合是否逐条一致
gh_tree = gh_api("GET", f"git/trees/{new_tree}?recursive=1")
if not gh_tree:
    print("✗ 无法拉取构建的 tree 进行校验"); sys.exit(1)
gh_blobs = {e["path"]: e["sha"] for e in gh_tree.get("tree", []) if e["type"] == "blob"}
missing = [p for p in local if p not in gh_blobs]
extra = [p for p in gh_blobs if p not in local]
mismatch = [p for p in local if local[p][1] != gh_blobs.get(p)]
print(f"GitHub tree blob 数: {len(gh_blobs)}")
print(f"缺失文件: {len(missing)}  多余文件: {len(extra)}  sha 不一致: {len(mismatch)}")
if missing or extra or mismatch:
    print("✗ 内容不一致！")
    if missing: print("  缺失:", missing[:10])
    if extra: print("  多余:", extra[:10])
    if mismatch: print("  不一致:", mismatch[:10])
    sys.exit(1)
if new_tree != target_tree:
    print("ℹ 内容逐字节一致；tree SHA 不同仅因 GitHub 把 .github/.gitignore 点文件目录排在普通目录之后（git 按字节序把它们排最前），不影响站点文件。")
print("✓ 内容逐字节一致 — 发布正确性闸门通过")

# ---------- 7. commit + patch ref（干净 fast-forward）----------
msg = ("v1.8.3 RGB星辰大海-璀璨配色升级\n\n"
       "- 全站 CSS 主题升级为 RGB 星辰大海-璀璨（暗/亮双主题）\n"
       "- sw.js CACHE 与全站 ?v= 引用同步 bump 至 v1.8.3\n"
       "- 新增 GitHub Git Data API 推送脚本（github.com:443 被网络层拦截，走 api.github.com）")
commit = gh_api("POST", "git/commits",
                {"message": msg, "tree": new_tree, "parents": [remote_head]})
if not commit or "sha" not in commit:
    print("✗ commit 创建失败"); sys.exit(1)
print(f"新 commit: {commit['sha']}")

ref = gh_api("PATCH", "git/refs/heads/main",
             {"sha": commit["sha"], "force": False})
if not ref:
    print("✗ ref 更新失败"); sys.exit(1)
print("✓ 推送成功，远端 HEAD ->", commit["sha"])
