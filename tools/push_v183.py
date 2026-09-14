#!/usr/bin/env python3
"""GitHub API 推送脚本 - RGB星辰大海-璀璨 v1.8.3 (修正版)"""
import json, os, subprocess, hashlib, base64, sys, time

REPO = "alextok200-boop/alextok200-boop.github.io"
SITE_DIR = os.path.dirname(os.path.abspath(__file__))

def gh(method, path, data=None):
    import urllib.request
    token = os.environ.get("GH_TOKEN") or ""
    if not token:
        try:
            r = subprocess.run(["gh", "auth", "token"], capture_output=True, text=True)
            token = r.stdout.strip()
        except:
            pass
    url = f"https://api.github.com/repos/{path}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    if method == "POST" and data:
        req.data = json.dumps(data, ensure_ascii=False).encode("utf-8")
        req.add_header("Content-Type", "application/json")
    elif method == "PATCH" and data:
        req.data = json.dumps(data, ensure_ascii=False).encode("utf-8")
        req.add_header("Content-Type", "application/json")
        req.method = "PATCH"
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            if resp.status == 204:
                return {"sha": "ok"}
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"API Error: {e}", file=sys.stderr)
        return None

def get_head_sha():
    r = gh("GET", f"{REPO}/commits/main")
    return r["sha"] if r else None

def post_blob(content, encoding="utf-8"):
    data = {
        "content": content if encoding == "utf-8" else base64.b64encode(content.encode()).decode(),
        "encoding": encoding
    }
    return gh("POST", f"{REPO}/git/blobs", data)

def post_tree(base_tree, entries):
    data = {"base_tree": base_tree, "tree": entries}
    return gh("POST", f"{REPO}/git/trees", data)

def post_commit(message, tree_sha, parents):
    data = {"message": message, "tree": tree_sha, "parents": parents}
    return gh("POST", f"{REPO}/git/commits", data)

def patch_ref(ref, sha, force=False):
    data = {"sha": sha, "force": force}
    return gh("PATCH", f"{REPO}/git/refs/{ref}", data)

# 获取本地 HEAD tree
local_tree_sha = subprocess.run(
    ["git", "rev-parse", "HEAD^{tree}"],
    cwd=SITE_DIR, capture_output=True, text=True
).stdout.strip()

# 获取远端 HEAD
remote_head = get_head_sha()
print(f"远端 HEAD: {remote_head}")
print(f"本地 HEAD tree: {local_tree_sha}")

# 只获取已提交的文件列表
files_result = subprocess.run(
    ["git", "ls-tree", "-r", "HEAD", "--name-only"],
    cwd=SITE_DIR, capture_output=True, text=True
).stdout.strip().split('\n')

print(f"已提交文件数: {len(files_result)}")

# 构建 tree entries（只包含已提交的文件）
entries = []
for relpath in files_result:
    fpath = os.path.join(SITE_DIR, relpath)
    if not os.path.exists(fpath):
        continue
    # 检测是否为文本文件
    try:
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        entries.append({
            "path": relpath,
            "mode": "100644",
            "type": "blob",
            "content": content
        })
    except UnicodeDecodeError:
        # 二进制文件：使用 blob API
        with open(fpath, "rb") as f:
            raw = f.read()
        data = {
            "content": base64.b64encode(raw).decode(),
            "encoding": "base64"
        }
        blob = gh("POST", f"{REPO}/git/blobs", data)
        if blob and "sha" in blob:
            entries.append({
                "path": relpath,
                "mode": "100644",
                "type": "blob",
                "sha": blob["sha"]
            })
        else:
            print(f"Failed to upload blob for {relpath}")

print(f"共 {len(entries)} 个文件")

# 创建 tree
new_tree = post_tree(remote_head, entries)
if not new_tree or "sha" not in new_tree:
    print("Failed to create tree")
    sys.exit(1)
print(f"新 tree SHA: {new_tree['sha']}")

# 校验 tree
if new_tree["sha"] == local_tree_sha:
    print("✓ tree 逐位一致")
else:
    print(f"✗ tree 不一致: {new_tree['sha']} vs {local_tree_sha}")
    sys.exit(1)

# 创建 commit
msg = "v1.8.3 RGB星辰大海-璀璨配色升级"
commit = post_commit(msg, new_tree["sha"], [remote_head])
if not commit or "sha" not in commit:
    print("Failed to create commit")
    sys.exit(1)
print(f"新 commit: {commit['sha']}")

# 更新 ref
ref = patch_ref("heads/main", commit["sha"])
if ref and "sha" in ref:
    print("✓ 推送成功")
else:
    print("✗ 推送失败")
    sys.exit(1)
