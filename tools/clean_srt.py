"""Strip YouTube auto-caption SRT into deduplicated plain text.

Usage: python clean_srt.py <input.srt> [<input.srt> ...]
Writes <basename>.txt next to each input.
"""
from pathlib import Path
import re
import sys

CUE_RE = re.compile(r"^\d+$")
TIME_RE = re.compile(r"^\d\d:\d\d:\d\d[,.]\d{3}\s*-->")


def extract_text(srt_path: Path) -> str:
    lines = []
    for raw in srt_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or CUE_RE.match(line) or TIME_RE.match(line):
            continue
        lines.append(line)

    # Dedup consecutive duplicates (YouTube progressive-reveal artifact).
    deduped: list[str] = []
    for line in lines:
        if not deduped or deduped[-1] != line:
            deduped.append(line)
    return " ".join(deduped)


def main() -> None:
    for arg in sys.argv[1:]:
        src = Path(arg)
        text = extract_text(src)
        out = src.with_suffix(".txt")
        out.write_text(text + "\n", encoding="utf-8")
        wc = len(text.split())
        print(f"{src.name} -> {out.name}  ({wc} words)")


if __name__ == "__main__":
    main()
