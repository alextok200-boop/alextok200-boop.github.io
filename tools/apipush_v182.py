# -*- coding: utf-8 -*-
"""
apipush_v182.py —— 用 GitHub Git Data API 推送 v1.8.2（绕行 git push）

策略：对「相对远端 HEAD 有差异」的每个路径，从本地 HEAD 的 git 对象读取内容，
      统一用 POST /git/blobs 建 blob（base64，天然支持二进制），再建 tree。
      删除的路径在 tree 中置 sha=null。
"""
import base64
import io
import json
import subprocess
import sys

REPO = "alextok200-boop/alextok200-boop.github.io"
REMOTE_HEAD = "ae7f1df1a9e5993bb06787c34a2397d481d8406f"
GH = r"C:\Program Files\GitHub CLI\gh.exe"


def gh(*args, input_bytes=None, check=True, retries=5):
    env = {"GH_CONFIG_DIR": r"C:\Users\alext\AppData\Roaming\GitHub CLI"}
    import os, time
    e = dict(os.environ)
    e.update(env)
    last = b""
    for attempt in range(retries):
        r = subprocess.run([GH] + list(args), input=input_bytes,
                           capture_output=True, env=e)
        if r.returncode == 0:
            return r.stdout
        last = r.stderr
        msg = r.stderr.decode("utf-8", "ignore")
        if ("Bad Gateway" in msg or "502" in msg or "Server Error" in msg
                or "timeout" in msg.lower()):
            time.sleep(2 + attempt * 2)
            continue
        break
    if check:
        print("GH FAIL:", " ".join(args))
        print(last.decode("utf-8", "ignore")[:2000])
        sys.exit(1)
    return b""


def git(*args):
    r = subprocess.run(["git"] + list(args), capture_output=True)
    if r.returncode != 0:
        print("GIT FAIL:", " ".join(args), r.stderr.decode("utf-8", "ignore")[:500])
        sys.exit(1)
    return r.stdout


# --- 1. 取差异清单（相对远端 HEAD） ---
out = git("diff", "--name-status", "-z", REMOTE_HEAD, "HEAD").decode("utf-8")
parts = out.split("\0")
changes = []  # (status, path)
i = 0
while i < len(parts):
    st = parts[i]
    if not st:
        i += 1
        continue
    if st.startswith("R") or st.startswith("C"):
        changes.append((st[0], parts[i + 2]))
        i += 3
    else:
        changes.append((st[0], parts[i + 1]))
        i += 2

print("差异条目：%d" % len(changes))

# --- 2. 逐项建 blob（带本地缓存，重跑幂等） ---
import hashlib
CACHE_FILE = "_blobcache.json"
try:
    blob_cache = json.load(io.open(CACHE_FILE, encoding="utf-8"))
except Exception:
    blob_cache = {}

tree = []
for st, path in changes:
    if st == "D":
        tree.append({"path": path, "mode": "100644", "type": "blob", "sha": None})
        print("  D  %s" % path)
        continue
    raw = git("show", "HEAD:%s" % path)
    # 判断可执行位
    mode = "100644"
    ls = git("ls-tree", "HEAD", "--", path).decode("utf-8", "ignore")
    if ls.startswith("100755"):
        mode = "100755"
    key = hashlib.sha256(raw).hexdigest()
    if key in blob_cache:
        sha = blob_cache[key]
        cached = " (cached)"
    else:
        b64 = base64.b64encode(raw).decode("ascii")
        payload = json.dumps({"content": b64, "encoding": "base64"}).encode("utf-8")
        sha = gh("api", "-X", "POST", "repos/%s/git/blobs" % REPO,
                 "--input", "-", input_bytes=payload).decode().strip()
        sha = json.loads(sha)["sha"] if sha.startswith("{") else sha
        blob_cache[key] = sha
        io.open(CACHE_FILE, "w", encoding="utf-8").write(json.dumps(blob_cache))
        cached = ""
    tree.append({"path": path, "mode": mode, "type": "blob", "sha": sha})
    print("  %s  %s  [%d B]%s" % (st, path, len(raw), cached))

# --- 3. 建 tree ---
payload = {"base_tree": git("rev-parse", REMOTE_HEAD + "^{tree}").decode().strip(),
           "tree": tree}
io.open("_tree.json", "w", encoding="utf-8").write(json.dumps(payload, ensure_ascii=False))
res = gh("api", "-X", "POST", "repos/%s/git/trees" % REPO,
         "--input", "_tree.json").decode()
new_tree = json.loads(res)["sha"]
print("\nNEW_TREE =", new_tree)

# --- 4. 与本地 HEAD tree 比对（最高效校验） ---
local_tree = git("rev-parse", "HEAD^{tree}").decode().strip()
print("LOCAL_TREE =", local_tree)
if new_tree == local_tree:
    print("✓ tree 逐位一致，内容零偏差")
else:
    print("✗ tree 不一致！停下排查")
    sys.exit(1)

io.open("_newtree.txt", "w").write(new_tree)
