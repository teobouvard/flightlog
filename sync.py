from argparse import ArgumentParser
from pathlib import Path
import logging
from shutil import copy

ROOT_DIR = Path("logs")


def parse_args():
    parser = ArgumentParser()

    parser.add_argument("input_dir", type=Path, help="directory containing IGC tracks")

    return parser.parse_args()


def sync_logs(directory: Path):
    for f in directory.rglob("*.[iI][gG][cC]"):
        parts = f.name.split("-")
        if len(parts) < 3:
            logging.error(f"unexpected filename: {f.name}")
            continue
        year, month, day = parts[:3]
        subdir = ROOT_DIR / year / month / day
        subdir.mkdir(parents=True, exist_ok=True)
        copy(f, subdir)


if __name__ == "__main__":
    args = parse_args()
    sync_logs(args.input_dir)
