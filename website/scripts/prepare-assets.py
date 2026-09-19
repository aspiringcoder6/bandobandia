from __future__ import annotations

import json
import re
import shutil
import unicodedata
from pathlib import Path

from PIL import Image, ImageOps


PROJECT = Path(__file__).resolve().parents[1]
SOURCE = PROJECT.parent / "images"
OUTPUT = PROJECT / "static" / "assets"
DATA_OUTPUT = PROJECT / "src" / "data" / "products.json"


SECTION_FILES = {
    "TRANG CHỦ": {
        "Thiết kế chưa có tên (1).png": ("home/scan-phone.webp", 1200),
        "lang-det-lanh-lung-tamdocx-1669088037626 (1).webp": ("home/artisan-drawing.webp", 1800),
        "ChatGPT Image Sep 18, 2026, 10_42_35 PM.png": ("home/motif.webp", 1200),
        "481063444_122107418696769958_8759241447968988611_n.jpg": ("home/community.webp", 1400),
        "13.jpg": ("home/weaving-women.webp", 1800),
        "11.webp": ("home/costume-display.webp", 1800),
        "10.avif": ("home/hero-detail.webp", 1800),
    },
    "GIỚI THIỆU CHIẾN DỊCH": {
        "image.webp": ("campaign/mountains.webp", 1800),
        "8.jpg": ("campaign/community.webp", 1600),
        "6aa1fa601aea4a8cb8336edb8b7b8a93.webp": ("campaign/drawing.webp", 1600),
    },
    "BẢN ĐỒ LÙNG TÁM": {
        "Bìa section đầu.webp": ("village/hero.webp", 1800),
        "Section 2 _Giữa đại ngàn_": ("village/between-mountains.webp", 1800),
        "Không gian dệt lanh.webp": ("village/weaving-space.webp", 1600),
        "Nhà nghệ nhân Vàng Thị Mai.jpg": ("village/artisan-vang-thi-mai.webp", 1400),
        "Những nếp nhà.jpg": ("village/village-homes.webp", 1600),
        "Núi Quản Bạ.jpg": ("village/quan-ba.webp", 1800),
        "Ruộng bậc thang.webp": ("village/terraces.webp", 1600),
    },
    "HÀNH TRÌNH VẢI LANH": {
        "Ảnh section header.webp": ("journey/hero.webp", 1600),
        "Trồng và thu hoạch lanh.jpg": ("journey/harvest.webp", 1400),
        "Xử lý và se sợi lanh.webp": ("journey/spin.webp", 1800),
        "Dệt vải.jpg": ("journey/weave.webp", 1600),
        "Nhuộm và tạo họa tiết.jpg": ("journey/dye.webp", 1400),
        "Ảnh section hoàn thiện sản phẩm.png": ("journey/finished.webp", 1800),
    },
}


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii").lower()
    ascii_text = re.sub(r"[^a-z0-9]+", "-", ascii_text).strip("-")
    return ascii_text or "asset"


def save_webp(source: Path, destination: Path, max_edge: int, quality: int) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        image.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        image.save(destination, "WEBP", quality=quality, method=6)


def prepare_sections() -> None:
    for folder_name, files in SECTION_FILES.items():
        for filename, (target, max_edge) in files.items():
            save_webp(SOURCE / folder_name / filename, OUTPUT / target, max_edge, 84)


def prepare_products() -> list[dict[str, object]]:
    product_root = SOURCE / "DANH MỤC SẢN PHẨM"
    products: list[dict[str, object]] = []
    for index, folder in enumerate(sorted((p for p in product_root.iterdir() if p.is_dir()), key=lambda p: p.name), start=1):
        slug = f"{index:02d}-{slugify(folder.name)}"
        files = sorted(p for p in folder.iterdir() if p.is_file())
        urls: list[str] = []
        for image_index, source in enumerate(files, start=1):
            relative = Path("products") / slug / f"{image_index:02d}.webp"
            save_webp(source, OUTPUT / relative, 960, 81)
            urls.append(f"/assets/{relative.as_posix()}")

        if folder.name.startswith("Áo"):
            category = "Trang phục"
        elif folder.name.startswith("Túi"):
            category = "Túi & phụ kiện"
        else:
            category = "Đồ thủ công"

        products.append(
            {
                "id": slug,
                "name": folder.name,
                "category": category,
                "images": urls,
            }
        )
    return products


def main() -> None:
    if PROJECT not in OUTPUT.resolve().parents:
        raise RuntimeError("Refusing to write assets outside the website project")
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    prepare_sections()
    products = prepare_products()
    if len(products) != 18:
        raise RuntimeError(f"Expected 18 products, found {len(products)}")
    DATA_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    DATA_OUTPUT.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(path.stat().st_size for path in OUTPUT.rglob("*") if path.is_file())
    print(json.dumps({"products": len(products), "asset_mb": round(total / 1024 / 1024, 2)}))


if __name__ == "__main__":
    main()
