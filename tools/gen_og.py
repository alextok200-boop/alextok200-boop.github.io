# -*- coding: utf-8 -*-
"""生成社交分享默认图 og-default.png（1200x630）"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "img", "og-default.png")
W, H = 1200, 630

BG = (9, 7, 17)
VIOLET = (147, 51, 234)
PINK = (255, 94, 201)
CYAN = (0, 200, 255)
GREEN = (0, 255, 163)
WHITE = (255, 255, 255)
DIM = (167, 159, 196)
BORDER = (42, 32, 64)

FONT_BOLD = "C:/Windows/Fonts/msyhbd.ttc"
FONT_REG = "C:/Windows/Fonts/msyh.ttc"


def radial_glow(img, cx, cy, radius, color, strength=0.55):
    """用多层同心圆模拟光晕（PIL 无原生高斯径向渐变）"""
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(glow)
    layers = 60
    for i in range(layers, 0, -1):
        r = radius * i / layers
        alpha = int(255 * strength * (1 - i / layers) ** 2 / layers * 6)
        d.ellipse([cx - r, cy - r, cx + r, cy + r],
                  fill=(color[0], color[1], color[2], max(0, min(60, alpha))))
    return Image.alpha_composite(img.convert("RGBA"), glow)


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    img = Image.new("RGB", (W, H), BG)
    # 背景纹理：斜向细线
    d = ImageDraw.Draw(img)
    for i in range(0, W + H, 26):
        d.line([(i, 0), (i - H, H)], fill=(18, 13, 32), width=1)

    img = radial_glow(img, W * 0.82, H * 0.28, 380, PINK, 0.9)
    img = radial_glow(img, W * 0.12, H * 0.86, 320, VIOLET, 0.9)
    d = ImageDraw.Draw(img)

    # 主标题
    f_name = ImageFont.truetype(FONT_BOLD, 76)
    d.text((80, 150), "戴程鹏", font=f_name, fill=WHITE)
    f_en = ImageFont.truetype(FONT_REG, 34)
    d.text((82, 246), "DAI CHENGPENG", font=f_en, fill=DIM)

    # 身份
    f_role = ImageFont.truetype(FONT_BOLD, 40)
    d.text((80, 316), "电商操盘手 · AI 技能包工程负责人", font=f_role, fill=VIOLET)

    # 分隔霓虹线
    d.line([(80, 396), (330, 396)], fill=CYAN, width=4)
    d.line([(330, 396), (560, 396)], fill=PINK, width=4)
    d.line([(560, 396), (700, 396)], fill=GREEN, width=4)

    # 关键词
    f_tag = ImageFont.truetype(FONT_REG, 30)
    d.text((80, 430), "品牌电商操盘   跨境增长   数据驱动决策", font=f_tag, fill=WHITE)

    # 域名
    d.text((80, 520), "alextok200-boop.github.io", font=f_tag, fill=DIM)

    # 右侧数据卡
    box_x, box_y, box_w, box_h = 760, 150, 360, 330
    d.rounded_rectangle([box_x, box_y, box_x + box_w, box_y + box_h],
                        radius=20, fill=(18, 11, 31), outline=BORDER, width=2)
    stats = [("49", "店铺矩阵"), ("9", "品牌矩阵"), ("$10M+", "年 GMV")]
    y = box_y + 40
    for num, label in stats:
        f_num = ImageFont.truetype(FONT_BOLD, 44)
        f_lab = ImageFont.truetype(FONT_REG, 22)
        d.text((box_x + 32, y), num, font=f_num, fill=WHITE)
        tb = d.textbbox((0, 0), num, font=f_num)
        d.text((box_x + 44 + (tb[2] - tb[0]), y + 18), label, font=f_lab, fill=DIM)
        y += 92

    img.save(OUT)
    print("生成", os.path.relpath(OUT, ROOT), img.size)


if __name__ == "__main__":
    main()
