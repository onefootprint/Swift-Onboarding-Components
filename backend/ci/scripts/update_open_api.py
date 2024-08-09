import os
import json
import requests
from collections import defaultdict
from urllib.parse import unquote


# Every API endpoint must have only one of these tag values
IDENTIFYING_TAG_VALUES = [
    "Private",
    "PublicApi",
    "Hosted",
    "Preview",
    "Deprecated",
    "PhasedOut",
]

# APIs with these identifying tags are shown in our docs site - we should apply more scrutiny to them
TENANT_VISIBLE_TAG_VALUES = ["PublicApi", "Preview", "PhasedOut"]

# Only APIs that take one of these auth methods should ever be publicly documented - otherwise,
# the API isn't usable
VISIBLE_API_SECURITY = ["Secret API Key", "Client Token"]

ALLOWED_NO_RESPONSE_APIS = [
    ("get", "/users/vault/decrypt/{token}"),
    ("post", "/vault_proxy/jit"),
    ("post", "/vault_proxy/{id}"),
    ("post", "/vault_proxy/reflect"),
]


class Endpoint:
    """
    In-memory representation of an Open API endpoint
    """

    def __init__(self, url, method, path_info):
        self.url = url
        self.method = method
        self._path_info = path_info

    @property
    def identifying_tag(self):
        tags = self._path_info["tags"]
        identifying_tags = set(tags) & set(IDENTIFYING_TAG_VALUES)
        # Enforce that every API has one and only one "identifying tag"
        assert (
            identifying_tags
        ), f"{self.method.upper()} {self.url} doesn't have an identifying tag: {tags}"
        assert (
            len(identifying_tags) == 1
        ), f"{self.method.upper()} {self.url} has more than one identifying tags: {tags}"
        identifying_tag = next(iter(identifying_tags))
        return identifying_tag

    @property
    def is_public(self):
        return self.identifying_tag in TENANT_VISIBLE_TAG_VALUES

    @property
    def schemas(self):
        """Computes the schemas that are used for the endpoint"""
        all_refs = list(find_keys(self._path_info, "$ref"))
        return [unquote(t) for t in all_refs]

    @property
    def security_schemes(self):
        """Computes the security schemes that are used for the endpoint"""
        security_schemes = self._path_info.get("security") or []
        if not self.is_public:
            # No processing needed for APIs that aren't documented for tenants
            return security_schemes

        public_security_schemes = [
            i
            for i in security_schemes
            if any(k in VISIBLE_API_SECURITY for k in i.keys())
        ]
        assert (
            public_security_schemes
            # This one is weird
            or self.url == "/users/vault/decrypt/{token}"
            or "ClientVaulting" in self._path_info.get("tags")
        ), f"API auth not found in schemes for {self.method.upper()} {self.url}. No reason to document if the API is not accesible via an accessible auth method"
        assert not any(
            "firm" in k.lower() for s in public_security_schemes for k in s
        ), "Couldn't scrub out firm employee auth from security - maybe you changed the name of the security?"
        return public_security_schemes

    @property
    def path_info(self):
        """
        Serializes the Endpoint back into open-api JSON path info
        """
        # Update the description
        description = self._path_info.get("description", "")
        if self.identifying_tag == "Preview":
            # Add a disclaimer tag to all Preview APIs
            description = f"This is a preview API and may actively change. We will give notice before making backwards-incompatible changes.\n{description}"
        if self.identifying_tag == "PhasedOut":
            # Add a disclaimer tag to all PhasedOut APIs
            description = f"This API is phased out and is not to be used by new applications. It may change, but we will give notice before making backwards-incompatible changes.\n{description}"
        if self.identifying_tag == "Deprecated":
            # Add a disclaimer tag to all Deprecated APIs
            description = f"THIS API IS DEPRECATED.\n\n{description}"

        if (
            self.identifying_tag in {"Preview", "PublicApi"}
            and (self.method, self.url) not in ALLOWED_NO_RESPONSE_APIS
        ):
            # Make sure there's a documented response for public-facing APIs
            responses = self._path_info.get("responses", {})
            assert responses, f"{self.method} {self.url} does not have a response body"
            assert (
                len(responses) <= 1
            ), f"{self.method} {self.url} has too many response bodies. Our docs site does not support APIs with multiple responses"

        return {
            **self._path_info,
            "description": description,
            "security": self.security_schemes,
        }


def find_keys(node, key):
    """
    Recursively traverse the provided node to yield an iterator of all dictionary values with the provided key
    """
    if isinstance(node, list):
        for item in node:
            yield from find_keys(item, key)
    if isinstance(node, dict):
        for _, value in node.items():
            yield from find_keys(value, key)
        if node.get(key):
            yield node.get(key)


def get_apis(open_api_spec, tags):
    """
    Replace the paths in the open API spec with only the public paths, and validate the tags for
    each endpoint.
    """
    # Parse endpoints
    endpoints = [
        Endpoint(url, method, path_info)
        for (url, methods_for_url) in open_api_spec["paths"].items()
        for method, path_info in methods_for_url.items()
    ]
    # Filter out the endpoints that don't have a matching tag.
    # Track the paths and entity refs that have a matching tag
    paths_dict = defaultdict(dict)
    used_entity_refs = set()
    used_security_schemes = set()
    for endpoint in endpoints:
        if endpoint.identifying_tag in tags:
            paths_dict[endpoint.url][endpoint.method] = endpoint.path_info
            used_entity_refs |= set(endpoint.schemas)
            used_security_schemes |= set(
                k for i in endpoint.security_schemes for k in i.keys()
            )
    # Create the final list of all schemas used by the matching endpoints
    used_entity_names = [schema_ref.split("/")[-1] for schema_ref in used_entity_refs]
    used_schemas = {
        name: open_api_spec["components"]["schemas"][name]
        for name in sorted(used_entity_names)
    }
    # Create final list of securitySchemes used by the matching endpoints
    used_security_schemes = {
        name: open_api_spec["components"]["securitySchemes"][name]
        for name in sorted(used_security_schemes)
    }
    # Often creates merge conflicts
    info = {**open_api_spec["info"]}
    info.pop("version")
    return {
        **open_api_spec,
        "components": {
            **open_api_spec["components"],
            "securitySchemes": used_security_schemes,
            "schemas": used_schemas,
        },
        "paths": paths_dict,
        "info": info,
    }


if __name__ == "__main__":
    # If running this script, actually output the new open api spec
    BASE_URL = os.environ.get("TEST_URL") or "http://localhost:8000"
    MONOREPO_DIR = os.environ.get("MONOREPO_DIR")
    assert MONOREPO_DIR, "MONOREPO_DIR must be provided"
    path = f"{MONOREPO_DIR}/frontend/apps/docs/src/pages/api-reference/assets"
    os.makedirs(path, exist_ok=True)

    open_api_spec = requests.get(f"{BASE_URL}/docs-spec-v3").json()

    specs = [
        (["PublicApi", "Preview", "PhasedOut"], "public-api-docs.json"),
        (["Hosted"], "hosted-api-docs.json"),
        (["Private"], "dashboard-api-docs.json"),
    ]
    for tags, file_name in specs:
        spec = get_apis(open_api_spec, tags)
        with open(f"{path}/{file_name}", "w") as f:
            f.write(json.dumps(spec, indent=4))
            f.close()
