import pytest
from tests.constants import ENVIRONMENT
from tests.utils import get
from scripts.update_open_api import get_apis


@pytest.mark.skipif(
    ENVIRONMENT in ("ephemeral", "dev", "production"),
    reason="API does not exist in dev or prod deployments",
)
def test_open_api():
    # Validate that the public APIs we expose are sane
    open_api_spec = get("docs-spec-v3")
    public_open_api_spec = get_apis(open_api_spec, "PublicApi")
    preview_open_api_spec = get_apis(open_api_spec, "Preview")

    def print_apis(open_api_spec, title):
        paths_str = [
            f"{method.upper()} {url}"
            for (url, methods_for_path) in open_api_spec["paths"].items()
            for method in methods_for_path
        ]
        print(f"===== {title} =====")
        print("\n".join(paths_str))

    print_apis(public_open_api_spec, "Publicly-exposed APIs")
    print_apis(preview_open_api_spec, "Preview APIs")
