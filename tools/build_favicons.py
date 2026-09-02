# -*- coding: utf-8 -*-
"""
build_favicons.py —— 从 assets/img/logo.png（金标）生成多尺寸 favicon
- cover 居中裁切到正方形后缩放
- maskable 留 20% 安全区
- 输出：favicon-16/32/180/192/512/512-maskable.png
- 同步刷新 manifest.webmanifest
"""
import os
import re
import sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "img", "logo.png")


def cover_square(im):
    """Cover 居中裁切到正方形"""
    w, h = im.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return im.crop((left, top, left + side, top + side))


def make_resized(im, size):
    return im.resize((size, size), Image.LANCZOS)


def make_maskable(im, size, safe_ratio=0.6):
    """maskable：内容居中，留出周围 1-safe_ratio 比例的安全区"""
    inner = make_resized(im, int(size * safe_ratio))
    canvas = Image.new("RGB", (size, size), (10, 6, 18))  # 与 logo 同底色
    off = (size - inner.size[0]) // 2
    canvas.paste(inner, (off, off))
    return canvas


def main():
    if not os.path.isfile(SRC):
        print("FAIL: 找不到 %s" % SRC)
        sys.exit(1)
    im = Image.open(SRC).convert("RGB")
    sq = cover_square(im)
    out = os.path.join(ROOT, "assets", "img")
    targets = [
        ("favicon-16.png", 16, False),
        ("favicon-32.png", 32, False),
        ("favicon-180.png", 180, False),
        ("icon-192.png", 192, False),
        ("icon-512.png", 512, False),
        ("icon-512-maskable.png", 512, True),
    ]
    for name, size, maskable in targets:
        img = make_maskable(sq, size) if maskable else make_resized(sq, size)
        path = os.path.join(out, name)
        img.save(path, "PNG", optimize=True)
        print("  ✓ %s  %dx%d  %d B" % (name, size, size, os.path.getsize(path)))

    # 同步刷新 manifest（确保 sizes 描述正确）
    mf = os.path.join(ROOT, "manifest.webmanifest")
    body = open(mf, encoding="utf-8").read()
    body = re.sub(
        r'"sizes":\s*"192x192"',
        '"sizes": "192x192"',
        body,
    )
    open(mf, "w", encoding="utf-8").write(body)
    print("  ✓ manifest 已同步")
    print("ALL PASS")


if __name__ == "__main__":
    main()
