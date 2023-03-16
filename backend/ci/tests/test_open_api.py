from tests.utils import get
from scripts.update_open_api import get_public_apis


def test_open_api():
    # Validate that the public APIs we expose are sane
    open_api_spec = get("docs-spec-v3")
    public_open_api_spec = get_public_apis(open_api_spec)
    public_paths_str = [
        f"{method.upper()} {url}"
        for (url, methods_for_path) in public_open_api_spec["paths"].items()
        for method in methods_for_path
    ]
    print("===== Publicly exposed APIs =====")
    print("\n".join(public_paths_str))
