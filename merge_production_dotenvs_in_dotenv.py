import os
from collections.abc import Sequence
from pathlib import Path

BASE_DIR = Path(__file__).parent.resolve()
PRODUCTION_DOTENVS_DIR = BASE_DIR / ".envs" / ".production"
PRODUCTION_DOTENV_FILES = [
    PRODUCTION_DOTENVS_DIR / ".django",
    PRODUCTION_DOTENVS_DIR / ".postgres",
]
DOTENV_FILE = BASE_DIR / ".env"


def merge(
    output_file: Path,
    files_to_merge: Sequence[Path],
) -> None:
    # Read the contents of the output file and split it into lines
    existing_content = output_file.read_text().splitlines()

    # Extract the keys from the existing content
    existing_keys = {line.split("=", 1)[0] for line in existing_content if "=" in line}

    merged_content = ""

    for merge_file in files_to_merge:
        lines = merge_file.read_text().splitlines()
        for line in lines:
            if "=" in line:
                key, _ = line.split("=", 1)
                if key not in existing_keys:
                    merged_content += line
                    merged_content += os.linesep
                    existing_keys.add(key)

    # Append the merged content to the output file
    with output_file.open("a") as f:
        f.write(merged_content)


if __name__ == "__main__":
    merge(DOTENV_FILE, PRODUCTION_DOTENV_FILES)
