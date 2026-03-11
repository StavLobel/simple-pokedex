import json
import re
from pathlib import Path

import pytest

pytestmark = pytest.mark.unit

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PACKAGE_JSON = PROJECT_ROOT / "package.json"
CHANGELOG = PROJECT_ROOT / "CHANGELOG.md"


@pytest.fixture
def package_data():
    return json.loads(PACKAGE_JSON.read_text())


class TestVersioning:
    """Verify package.json version and CHANGELOG.md consistency."""

    def test_package_json_has_version(self, package_data):
        """package.json must contain a non-empty 'version' field."""
        assert "version" in package_data
        assert isinstance(package_data["version"], str)
        assert len(package_data["version"]) > 0

    def test_version_follows_semver(self, package_data):
        """Version string must match MAJOR.MINOR.PATCH format."""
        semver_pattern = r"^\d+\.\d+\.\d+$"
        assert re.match(semver_pattern, package_data["version"]), (
            f"Version '{package_data['version']}' does not follow semver (MAJOR.MINOR.PATCH)"
        )

    def test_changelog_exists(self):
        """CHANGELOG.md must exist and be non-empty."""
        assert CHANGELOG.exists(), "CHANGELOG.md not found at project root"
        content = CHANGELOG.read_text()
        assert len(content.strip()) > 0, "CHANGELOG.md is empty"

    def test_changelog_has_current_version_entry(self, package_data):
        """CHANGELOG.md must contain a heading for the current package.json version."""
        version = package_data["version"]
        content = CHANGELOG.read_text()
        assert version in content, (
            f"CHANGELOG.md does not contain an entry for version {version}"
        )
