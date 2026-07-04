"""
Hash Calculator — computes multiple cryptographic hashes for a file.
Supports MD5, SHA1, SHA256, SHA512, and CRC32.
"""
import hashlib
import zlib
from typing import Dict
from utils.logger import get_logger

logger = get_logger(__name__)

CHUNK_SIZE = 65536  # 64 KB chunks for memory-efficient reading


class HashCalculator:
    """Calculates cryptographic and checksum hashes for binary files."""

    def calculate_all(self, file_path: str) -> Dict[str, str]:
        """
        Calculate all supported hashes for a file.

        Args:
            file_path: Absolute path to the file

        Returns:
            Dict with keys: md5, sha1, sha256, sha512, crc32
        """
        md5 = hashlib.md5()
        sha1 = hashlib.sha1()
        sha256 = hashlib.sha256()
        sha512 = hashlib.sha512()
        crc32_val = 0

        try:
            with open(file_path, "rb") as f:
                while chunk := f.read(CHUNK_SIZE):
                    md5.update(chunk)
                    sha1.update(chunk)
                    sha256.update(chunk)
                    sha512.update(chunk)
                    crc32_val = zlib.crc32(chunk, crc32_val)

            result = {
                "md5": md5.hexdigest().upper(),
                "sha1": sha1.hexdigest().upper(),
                "sha256": sha256.hexdigest().upper(),
                "sha512": sha512.hexdigest().upper(),
                "crc32": format(crc32_val & 0xFFFFFFFF, "08X"),
            }
            logger.debug(f"Hashes calculated for {file_path}: MD5={result['md5'][:8]}...")
            return result

        except Exception as e:
            logger.error(f"Hash calculation failed for {file_path}: {e}")
            return {"md5": "", "sha1": "", "sha256": "", "sha512": "", "crc32": ""}

    def calculate_md5(self, file_path: str) -> str:
        """Calculate MD5 hash only."""
        h = hashlib.md5()
        with open(file_path, "rb") as f:
            while chunk := f.read(CHUNK_SIZE):
                h.update(chunk)
        return h.hexdigest().upper()

    def calculate_sha256(self, file_path: str) -> str:
        """Calculate SHA-256 hash only."""
        h = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(CHUNK_SIZE):
                h.update(chunk)
        return h.hexdigest().upper()

    def calculate_sha512(self, file_path: str) -> str:
        """Calculate SHA-512 hash only."""
        h = hashlib.sha512()
        with open(file_path, "rb") as f:
            while chunk := f.read(CHUNK_SIZE):
                h.update(chunk)
        return h.hexdigest().upper()
