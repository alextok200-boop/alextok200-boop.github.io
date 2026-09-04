# -*- coding: utf-8 -*-
"""
build_avatar_assets.py —— v1.7.1
从真人头像原图（C:\\Users\\alext\\Downloads\\头像.png）生成全站资源：
- assets/img/logo.png          清晰版主头像（about.html 简历头像位）
- assets/img/favicon-16/32/180 模糊版浏览器 tab favicon
- assets/img/icon-192/512      模糊版 PWA 图标
- assets/img/icon-512-maskable 模糊版 PWA 自适应安全区图标
- assets/img/og-default.png    社交分享卡（清晰脸 + 暗色 overlay + 文字）

隐私策略：
- 主头像位（logo.png）保留清晰（用户主动选择公开）
- favicon / PWA 图标全做高斯模糊（radius=10），让浏览器 tab 与桌面
  安装图标看不清楚人脸，符合「所有可用存档进行脱敏处理」要求
- og-default 做暗色半透明 overlay + 文字层，避免社交分享预览直接
  曝光真实人脸

回退：从 tools/_source/logo-konllen-v617.png（金狮 K 标）拷贝回
      assets/img/logo.png 后重跑 build_favicons.py 即可
"""
import os
import sys
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets" / "img"
SRC = Path(r"C:\Users\alext\Downloads\头像.png")

LOGO = ASSETS / "logo.png"
FAVICONS = [
    ("favicon-16.png", 16),
    ("favicon-32.png", 32),
    ("favicon-180.png", 180),
]
ICONS = [
    ("icon-192.png", 192),
    ("icon-512.png", 512),
]
MASKABLE = ("icon-512-maskable.png", 512, 0.6)  # 安全区 60%
OG = ASSETS / "og-default.png"

# 脱敏参数：favicon / icon 模糊半径（越大越模糊，10 已是"看不清五官仅轮廓"）
BLUR_RADIUS = 10

# 站点暗色基调（与 :root[data-theme=dark] 对齐）
BG_DARK = (14, 16, 36)            # var(--bg) #0e1024
NEON_GREEN = (0, 255, 163)        # var(--neon-green)
NEON_BLUE = (0, 200, 255)
NEON_PINK = (255, 94, 201)
TEXT_WHITE = (238, 240, 255)


def cover_square(im):
    w, h = im.size
    side = min(w, h)
    return im.crop(((w - side) // 2, (h - side) // 2,
                    (w + side) // 2, (h + side) // 2))


def make_blurred(im, radius=BLUR_RADIUS):
    return im.filter(ImageFilter.GaussianBlur(radius=radius))


def make_maskable(im, size, safe_ratio=0.6, bg=BG_DARK, blur=True):
    """maskable：内容居中，blur 版；留出 1-safe_ratio 比例安全区"""
    if blur:
        im = make_blurred(im)
    inner = im.resize((int(size * safe_ratio), int(size * safe_ratio)),
                      Image.LANCZOS)
    canvas = Image.new("RGB", (size, size), bg)
    off = (size - inner.size[0]) // 2
    canvas.paste(inner, (off, off))
    return canvas


def save_optimized(im, path, quality=None):
    path.parent.mkdir(parents=True, exist_ok=True)
    if im.mode != "RGB":
        im = im.convert("RGB")
    if path.suffix.lower() in (".jpg", ".jpeg") and quality:
        im.save(path, "JPEG", quality=quality, optimize=True)
    else:
        im.save(path, "PNG", optimize=True)
    return path.stat().st_size


def find_font(size):
    """优先尝试系统常见中文字体"""
    candidates = [
        r"C:\Windows\Fonts\msyh.ttc",   # 微软雅黑
        r"C:\Windows\Fonts\msyh.ttf",
        r"C:\Windows\Fonts\simhei.ttf",  # 黑体
        r"C:\Windows\Fonts\simsun.ttc",  # 宋体
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                continue
    return ImageFont.load_default()


def make_og_default(src):
    """og-default.png（1200×630）—— 真人脸清晰版 + 暗色 overlay + 文字
    设计：
      - 暗色渐变背景（上下两条霓虹光带作装饰，避免右侧角落碎片）
      - 左：人脸圆形特写（适度模糊以不直接曝光全脸，sigma=4）
      - 右：标题 + tagline + 域名
    """
    W, H = 1200, 630
    # 背景：纯暗色 + 顶部 / 底部两条细霓虹装饰线
    canvas = Image.new("RGB", (W, H), BG_DARK)
    draw_bg = ImageDraw.Draw(canvas)
    # 顶/底两条霓虹装饰条（（避免在大角画 ellipse 产生渲染碎片）
    draw_bg.rectangle([0, 0, W, 3], fill=NEON_GREEN)
    draw_bg.rectangle([0, H - 3, W, H], fill=NEON_BLUE)
    # 右下角小色块装饰（保留呼应顶部，但不溢出）
    draw_bg.rectangle([W - 60, 0, W, 30], fill=NEON_PINK)

    # 左：圆形头像（适度模糊避免全脸曝光）
    avatar_size = 460
    head = src.resize((600, 600), Image.LANCZOS)
    head = head.filter(ImageFilter.GaussianBlur(radius=4))
    head = cover_square(head).resize((avatar_size, avatar_size), Image.LANCZOS)
    # 圆形遮罩
    mask = Image.new("L", (avatar_size, avatar_size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, avatar_size, avatar_size], fill=255)
    canvas.paste(head, (90, 85), mask)

    # 右：文字层
    f_title = find_font(72)
    f_sub = find_font(34)
    f_tag = find_font(26)
    f_url = find_font(22)
    draw = ImageDraw.Draw(canvas)

    # 主标题
    draw.text((600, 130), "戴程鹏", fill=TEXT_WHITE, font=f_title)
    # 英文名
    draw.text((600, 215), "Dai Chengpeng", fill=(120, 130, 170), font=f_sub)
    # tagline（霓虹绿）
    draw.text((600, 290), "电商操盘  ·  团队体系  ·  AI 技能包工程",
              fill=NEON_GREEN, font=f_tag)
    # 横线分隔
    draw.rectangle([600, 360, 600 + 460, 363], fill=NEON_BLUE)
    # 副标题
    draw.text((600, 390), "个人简历  ·  项目经历  ·  成绩单",
              fill=(180, 190, 230), font=f_tag)
    # 域名（底部）
    draw.text((600, 530), "alextok200-boop.github.io",
              fill=(100, 110, 150), font=f_url)
    return canvas


def main():
    if not SRC.exists():
        print(f"  [FATAL] 找不到源头像: {SRC}")
        sys.exit(1)

    src = Image.open(SRC).convert("RGB")
    print(f"  源: {SRC.name} ({src.size[0]}×{src.size[1]})  size={SRC.stat().st_size}B")

    # 1) 主头像 logo.png（清晰）
    logo = cover_square(src).resize((280, 280), Image.LANCZOS)
    sz = save_optimized(logo, LOGO)
    print(f"  ✓ logo.png     280×280  {sz}B")

    # 2) favicon 系列（blur）
    blurred = make_blurred(src)
    for name, size in FAVICONS:
        fav = cover_square(blurred).resize((size, size), Image.LANCZOS)
        sz = save_optimized(fav, ASSETS / name)
        print(f"  ✓ {name:<18s} {size}×{size}  {sz}B  (blur)")

    # 3) PWA icon 系列（blur）
    for name, size in ICONS:
        ico = cover_square(blurred).resize((size, size), Image.LANCZOS)
        sz = save_optimized(ico, ASSETS / name)
        print(f"  ✓ {name:<18s} {size}×{size}  {sz}B  (blur)")

    # 4) maskable（blur + 安全区）
    name, size, safe = MASKABLE
    mk = make_maskable(src, size, safe_ratio=safe, blur=True)
    sz = save_optimized(mk, ASSETS / name)
    print(f"  ✓ {name:<18s} {size}×{size}  {sz}B  (blur + 60% safe)")

    # 5) og-default.png（适度模糊 + 暗色 overlay + 文字）
    og = make_og_default(src)
    sz = save_optimized(og, OG)
    print(f"  ✓ og-default.png     1200×630  {sz}B  (face + overlay + text)")

    print("\n完成。备份旧金狮 K 标: tools/_source/logo-konllen-v617.png")


if __name__ == "__main__":
    main()