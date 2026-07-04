"""
Logging utility for StegInspector.
Provides colored, structured logging for all modules.
"""
import logging
import sys
from typing import Optional


class ColoredFormatter(logging.Formatter):
    """Custom formatter that adds colors to log levels."""

    COLORS = {
        "DEBUG": "\033[36m",    # Cyan
        "INFO": "\033[32m",     # Green
        "WARNING": "\033[33m",  # Yellow
        "ERROR": "\033[31m",    # Red
        "CRITICAL": "\033[35m", # Magenta
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        """Format log record with color coding."""
        color = self.COLORS.get(record.levelname, self.RESET)
        record.levelname = f"{color}{record.levelname:<8}{self.RESET}"
        return super().format(record)


def get_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """
    Create and configure a named logger.

    Args:
        name: Logger name (typically __name__ of the module)
        level: Logging level (default: INFO)

    Returns:
        Configured Logger instance
    """
    logger = logging.getLogger(name)

    if logger.handlers:
        return logger  # Already configured

    logger.setLevel(level)

    # Console handler with colors
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)

    formatter = ColoredFormatter(
        fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.propagate = False

    return logger
