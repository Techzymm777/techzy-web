"""Step 2 of 2: builds the social share images and icons in public/.

    public/og/techzy.jpg               default share image (1200x630)
    public/og/products/<id>.jpg        one per product in content/products.json
    public/icons/logo-512.png          Organization logo for structured data
    public/icons/apple-touch-icon.png  180x180 home-screen icon
    public/icons/favicon-48.png        PNG favicon fallback

Re-run after adding or changing a product (tests fail if one is missing):

    python3 -m venv .venv && .venv/bin/pip install pillow fonttools brotli
    .venv/bin/python scripts/share-images/make.py

Binary palette like the site: black, white, and white at opacity.
"""
import json
from io import BytesIO
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PUBLIC = ROOT / 'public'
W, H = 1200, 630
BLACK, WHITE = (0, 0, 0), (255, 255, 255)
MUTED = (158, 158, 158)  # white at .62 over black, for secondary text

# Inter ships as a woff2 web font; decompress it once for Pillow.
_ttf = BytesIO()
_font = TTFont(PUBLIC / 'fonts' / 'inter-latin-var.woff2')
_font.flavor = None
_font.save(_ttf)


def inter(size, weight):
    _ttf.seek(0)
    f = ImageFont.truetype(BytesIO(_ttf.getvalue()), size)
    f.set_variation_by_axes([weight])
    return f


def logo(name, width):
    im = Image.open(HERE / name).convert('RGBA')
    return im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)


def tracked(draw, xy, text, font, fill, tracking):
    """Draws text with letter-spacing (em units, negative = tighter)."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking * font.size


def width_of(draw, text, font, tracking):
    return sum(draw.textlength(ch, font=font) + tracking * font.size for ch in text)


def wrap(draw, text, font, max_width, tracking):
    lines, line = [], ''
    for word in text.split():
        trial = f'{line} {word}'.strip()
        if width_of(draw, trial, font, tracking) <= max_width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    return lines + [line]


def save_jpg(im, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.convert('RGB').save(path, 'JPEG', quality=86, optimize=True, progressive=True)


def default_image(seo):
    im = Image.new('RGB', (W, H), BLACK)
    d = ImageDraw.Draw(im)
    mark = logo('wordmark-white.png', 280)
    im.paste(mark, (80, 72), mark)
    big = inter(104, 800)
    lines = [s.strip() + '.' for s in seo['slogan'].split('.') if s.strip()][:2]  # "Brand New." "Factory Sealed."
    for i, line in enumerate(lines):
        tracked(d, (76, 222 + i * 112), line, big, WHITE, -0.045)
    d.line([(0, 498), (W, 498)], fill=WHITE, width=1)  # the seal cut
    small = inter(26, 500)
    tracked(d, (80, 536), 'LAPTOPS · YANGON & MANDALAY', small, MUTED, 0.12)
    url = seo['site'].replace('https://', '')
    tracked(d, (W - 80 - width_of(d, url, small, 0.04), 536), url, small, WHITE, 0.04)
    save_jpg(im, PUBLIC / 'og' / 'techzy.jpg')


def product_image(p):
    im = Image.new('RGB', (W, H), WHITE)
    # Left: the product photo, grayscale + contrast like the site, on paper.
    photo = Image.open(PUBLIC / 'assets' / 'images' / 'products' / p['image']).convert('RGBA')
    bg = Image.new('RGBA', photo.size, WHITE + (255,))
    bg.alpha_composite(photo)
    photo = ImageOps.autocontrast(ImageOps.grayscale(bg.convert('RGB')), cutoff=1).convert('RGB')
    photo.thumbnail((560, 520), Image.LANCZOS)
    im.paste(photo, ((630 - photo.width) // 2, (H - photo.height) // 2))
    # Right: ink panel with the name.
    d = ImageDraw.Draw(im)
    d.rectangle([630, 0, W, H], fill=BLACK)
    mark = logo('wordmark-white.png', 180)
    im.paste(mark, (690, 64), mark)
    label = inter(22, 500)
    tracked(d, (692, 214), p['badge'].upper(), label, MUTED, 0.14)
    name = inter(58, 700)
    lines = wrap(d, p['name'], name, 450, -0.03)
    for i, line in enumerate(lines[:3]):
        tracked(d, (688, 256 + i * 66), line, name, WHITE, -0.03)
    d.line([(690, 498), (W - 60, 498)], fill=WHITE, width=1)
    foot = inter(24, 500)
    tracked(d, (692, 530), 'Brand new. Factory sealed.', foot, WHITE, -0.01)
    tracked(d, (692, 566), '2-year warranty', foot, MUTED, -0.01)
    save_jpg(im, PUBLIC / 'og' / 'products' / f"{p['id']}.jpg")


def icons():
    out = PUBLIC / 'icons'
    out.mkdir(parents=True, exist_ok=True)
    # Organization logo: black wordmark on white, square.
    sq = Image.new('RGBA', (512, 512), WHITE + (255,))
    mark = logo('wordmark-black.png', 440)
    sq.alpha_composite(mark, ((512 - mark.width) // 2, (512 - mark.height) // 2))
    sq.convert('RGB').save(out / 'logo-512.png', optimize=True)
    # Home-screen icon + PNG favicon: white "t" mark on ink.
    for size, name in [(180, 'apple-touch-icon.png'), (48, 'favicon-48.png')]:
        ic = Image.new('RGBA', (size, size), BLACK + (255,))
        t = Image.open(HERE / 'mark-white.png').convert('RGBA').resize((size, size), Image.LANCZOS)
        ic.alpha_composite(t)
        ic.convert('RGB').save(out / name, optimize=True)


if __name__ == '__main__':
    seo = json.loads((ROOT / 'content' / 'seo.json').read_text())
    products = json.loads((ROOT / 'content' / 'products.json').read_text())
    default_image(seo)
    for p in products:
        product_image(p)
    icons()
    print(f'wrote og/techzy.jpg, {len(products)} product images, 3 icons')
