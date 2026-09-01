# -*- coding: utf-8 -*-
"""生成 PWA 应用图标（192 / 512 / 512-maskable）"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")
FONT_BOLD = "C:/Windows/Fonts/msyhbd.ttc"
FONT_REG = "C:/Windows/Fonts/msyh.ttc"

BG = (9, 7, 17)
VIOLET = (147, 51, 234)
PINK = (255, 94, 201)
CYAN = (0, 200, 255)
WHITE = (255, 255, 255)
DIM = (167, 159, 196)


def vertical_gradient(size, top, bottom):
    img = Image.new("RGB", (size, size))
    d = ImageDraw.Draw(img)
    for y in range(size):
        r = int(top[0] + (bottom[0] - top[0]) * y / size)
        g = int(top[1] + (bottom[1] - top[1]) * y / size)
        b = int(top[2] + (bottom[2] - top[2]) * y / size)
        d.line([(0, y), (size, y)], fill=(r, g, b))
    return img


def rounded(size, radius_ratio=0.22):
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * radius_ratio), fill=255)
    return mask


def make(size, path, maskable=False):
    # maskable：内容收进中心安全区（外圈 20% 可能被系统裁掉）
    pad = int(size * 0.2) if maskable else 0
    bg = Image.new("RGB", (size, size), BG)
    inner = size - pad * 2
    grad = vertical_gradient(inner, VIOLET, PINK).resize((inner, inner))
    grad.putalpha(255)
    if not maskable:
        grad = grad.resize((inner, inner))
        grad_rgba = Image.new("RGBA", (inner, inner))
        grad_rgba.paste(grad, (0, 0), rounded(inner) if False else None)
        grad = grad_rgba
    bg.paste(grad, (pad, pad))
    d = ImageDraw.Draw(bg)

    # 上方品牌字
    f_brand = ImageFont.truetype(FONT_BOLD, int(inner * 0.17))
    txt = "DAI·CP"
    tb = d.textbbox((0, 0), txt, font=f_brand)
    w = tb[2] - tb[0]
    d.text(((size - w) / 2, pad + inner * 0.28), txt, font=f_brand, fill=WHITE)

    # 下方身份小字
    f_sub = ImageFont.truetype(FONT_REG, int(inner * 0.075))
    sub = "电商操盘手"
    tb2 = d.textbbox((0, 0), sub, font=f_sub)
    w2 = tb2[2] - tb2[0]
    d.text(((size - w2) / 2, pad + inner * 0.55), sub, font=f_sub, fill=(255, 255, 255, 220))

    # 底部霓虹短线
    y = pad + inner * 0.72
    x1 = size / 2 - inner * 0.16
    x2 = size / 2 + inner * 0.16
    d.line([(x1, y), (size / 2, y)], fill=CYAN, width=max(2, int(inner * 0.012)))
    d.line([(size / 2, y), (x2, y)], fill=PINK, width=max(2, int(inner * 0.012)))

    if not maskable:
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(bg, (0, 0), rounded(size))
        out.save(path)
    else:
        bg.save(path)
    print("生成", os.path.relpath(path, ROOT), size)


if __name__ == "__main__":
    os.makedirs(IMG, exist_ok=True)
    make(192, os.path.join(IMG, "icon-192.png"))
    make(512, os.path.join(IMG, "icon-512.png"))
    make(512, os.path.join(IMG, "icon-512-maskable.png"), maskable=True)
