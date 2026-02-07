#!/usr/bin/env python3
"""Generate sleek PWA icon assets and favicon from a single procedural design."""

from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ICONS_DIR = ROOT / "public" / "icons"
FAVICON_PATH = ROOT / "src" / "app" / "favicon.ico"

BG_TOP = (7, 12, 20)
BG_BOTTOM = (17, 25, 38)
FOREGROUND = (238, 244, 252)


def smooth_coverage(sd: float, aa: float) -> float:
    """Convert signed distance to 0..1 alpha coverage with edge smoothing."""
    if sd <= -aa:
        return 1.0
    if sd >= aa:
        return 0.0
    return 0.5 - (sd / (2.0 * aa))


def distance_to_segment(
    px: float,
    py: float,
    ax: float,
    ay: float,
    bx: float,
    by: float,
) -> float:
    """Shortest distance from a point to a line segment."""
    abx = bx - ax
    aby = by - ay
    apx = px - ax
    apy = py - ay
    ab_len_sq = (abx * abx) + (aby * aby)
    if ab_len_sq == 0:
        return math.hypot(apx, apy)
    t = max(0.0, min(1.0, ((apx * abx) + (apy * aby)) / ab_len_sq))
    cx = ax + (abx * t)
    cy = ay + (aby * t)
    return math.hypot(px - cx, py - cy)


def blend_channel(bg: int, fg: int, alpha: float) -> int:
    return round((bg * (1.0 - alpha)) + (fg * alpha))


def render_icon_rgba(size: int) -> bytes:
    cx = size / 2.0
    cy = size / 2.0
    aa = max(0.7, size / 320.0)

    # Minimal clock-style mark.
    ring_radius = size * 0.31
    ring_stroke = max(2.0, size * 0.072)
    minute_width = max(2.0, size * 0.066)
    hour_width = max(2.0, size * 0.072)
    center_dot_radius = size * 0.03

    minute_angle = math.radians(-50)
    minute_len = size * 0.22
    minute_x = cx + (math.cos(minute_angle) * minute_len)
    minute_y = cy + (math.sin(minute_angle) * minute_len)

    hour_angle = math.radians(20)
    hour_len = size * 0.145
    hour_x = cx + (math.cos(hour_angle) * hour_len)
    hour_y = cy + (math.sin(hour_angle) * hour_len)

    pixels = bytearray(size * size * 4)
    idx = 0

    for y in range(size):
        t = y / (size - 1 if size > 1 else 1)
        bg_r = round(BG_TOP[0] + ((BG_BOTTOM[0] - BG_TOP[0]) * t))
        bg_g = round(BG_TOP[1] + ((BG_BOTTOM[1] - BG_TOP[1]) * t))
        bg_b = round(BG_TOP[2] + ((BG_BOTTOM[2] - BG_TOP[2]) * t))

        py = y + 0.5
        for x in range(size):
            px = x + 0.5
            dist_center = math.hypot(px - cx, py - cy)

            ring_cov = smooth_coverage(abs(dist_center - ring_radius) - (ring_stroke / 2.0), aa)
            minute_cov = smooth_coverage(
                distance_to_segment(px, py, cx, cy, minute_x, minute_y) - (minute_width / 2.0),
                aa,
            )
            hour_cov = smooth_coverage(
                distance_to_segment(px, py, cx, cy, hour_x, hour_y) - (hour_width / 2.0),
                aa,
            )
            dot_cov = smooth_coverage(dist_center - center_dot_radius, aa)

            fg_alpha = max(ring_cov, minute_cov, hour_cov, dot_cov)

            if fg_alpha > 0:
                out_r = blend_channel(bg_r, FOREGROUND[0], fg_alpha)
                out_g = blend_channel(bg_g, FOREGROUND[1], fg_alpha)
                out_b = blend_channel(bg_b, FOREGROUND[2], fg_alpha)
            else:
                out_r = bg_r
                out_g = bg_g
                out_b = bg_b

            pixels[idx] = out_r
            pixels[idx + 1] = out_g
            pixels[idx + 2] = out_b
            pixels[idx + 3] = 255
            idx += 4

    return bytes(pixels)


def png_chunk(tag: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def encode_png(size: int, rgba: bytes) -> bytes:
    signature = b"\x89PNG\r\n\x1a\n"
    ihdr = png_chunk(
        b"IHDR",
        struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0),
    )

    raw = bytearray()
    row_bytes = size * 4
    for row in range(size):
        raw.append(0)  # No filter.
        start = row * row_bytes
        raw.extend(rgba[start : start + row_bytes])

    idat = png_chunk(b"IDAT", zlib.compress(bytes(raw), level=9))
    iend = png_chunk(b"IEND", b"")
    return signature + ihdr + idat + iend


def encode_ico(images: list[tuple[int, bytes]]) -> bytes:
    header = struct.pack("<HHH", 0, 1, len(images))
    entries = bytearray()
    image_data = bytearray()
    offset = 6 + (16 * len(images))

    for size, png_data in images:
        width_byte = 0 if size >= 256 else size
        height_byte = 0 if size >= 256 else size
        entries.extend(
            struct.pack(
                "<BBBBHHII",
                width_byte,
                height_byte,
                0,  # palette colors
                0,  # reserved
                1,  # color planes
                32,  # bits per pixel
                len(png_data),
                offset,
            )
        )
        image_data.extend(png_data)
        offset += len(png_data)

    return header + entries + image_data


def write_file(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def main() -> None:
    png_sizes = {
        "icon-512x512.png": 512,
        "icon-192x192.png": 192,
        "apple-touch-icon.png": 180,
    }

    for filename, size in png_sizes.items():
        rgba = render_icon_rgba(size)
        png = encode_png(size, rgba)
        write_file(ICONS_DIR / filename, png)

    favicon_sizes = [16, 32, 48, 64, 128, 256]
    favicon_pngs = []
    for size in favicon_sizes:
        rgba = render_icon_rgba(size)
        favicon_pngs.append((size, encode_png(size, rgba)))

    write_file(FAVICON_PATH, encode_ico(favicon_pngs))
    print("Generated icon assets in public/icons and src/app/favicon.ico")


if __name__ == "__main__":
    main()
