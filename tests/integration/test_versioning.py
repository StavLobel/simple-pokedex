import json
import subprocess
from pathlib import Path

import pytest

pytestmark = pytest.mark.integration

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PACKAGE_JSON = PROJECT_ROOT / "package.json"


class TestVersionTagConsistency:
    """Verify git tags stay in sync with the declared package version."""

    def test_git_tag_matches_package_version(self):
        """A git tag 'v{version}' must exist matching the current package.json version."""
        version = json.loads(PACKAGE_JSON.read_text())["version"]
        expected_tag = f"v{version}"

        result = subprocess.run(
            ["git", "tag", "--list", expected_tag],
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT,
        )
        tags = result.stdout.strip().splitlines()
        assert expected_tag in tags, (
            f"Git tag '{expected_tag}' not found. "
            f"Existing tags: {tags or '(none)'}"
        )
