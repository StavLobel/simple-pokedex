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
        """If a git tag exists for the current version, it must match package.json."""
        version = json.loads(PACKAGE_JSON.read_text())["version"]
        expected_tag = f"v{version}"

        result = subprocess.run(
            ["git", "tag", "--list"],
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT,
        )
        all_tags = result.stdout.strip().splitlines()

        if not all_tags:
            pytest.skip("No git tags found (pre-release or shallow clone)")

        assert expected_tag in all_tags, (
            f"Git tag '{expected_tag}' not found. "
            f"Existing tags: {all_tags}"
        )
