import os
import json
import requests
from collections import defaultdict
from urllib.parse import unquote


# Every API endpoint must have only one of these tag values
IDENTIFYING_TAG_VALUES = ["Private", "PublicApi", "Hosted", "Preview"]


class Endpoint:
    """
    In-memory representation of an Open API endpoint
    """

    def __init__(self, url, method, path_info):
        self.url = url
        self.method = method
        self.path_info = path_info

    @property
    def identifying_tag(self):
        tags = self.path_info["tags"]
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
    def schemas(self):
        """Computes the schemas that are used for the endpoint"""
        request_type = (
            self.path_info.get("requestBody", {})
            .get("content", {})
            .get("application/json", {})
            .get("schema", {})
            .get("$ref")
        )
        response_types = [
            resp.get("content", {})
            .get("application/json", {})
            .get("schema", {})
            .get("$ref")
            for (_, resp) in self.path_info.get("responses", {}).items()
        ]
        other_response_types = [
            resp.get("content", {})
            .get("application/json", {})
            .get("schema", {})
            .get("properties", {})
            .get("data", {})
            .get("items", {})
            .get("$ref", {})
            for (_, resp) in self.path_info.get("responses", {}).items()
        ]
        all_types = response_types + other_response_types + [request_type]
        return [unquote(t) for t in all_types if t]

    def serialize(self):
        """
        Serializes the Endpoint back into open-api JSON path info
        """
        description = self.path_info["description"]
        if self.identifying_tag == "Preview":
            # Add a disclaimer tag to all Preview APIs
            description = f"This is a preview API. By using this, you consent to potentially breaking API changes.\n{description}"
        if "Deprecated" in self.path_info["tags"]:
            # Add a disclaimer tag to all Deprecated APIs
            description = f"THIS API IS DEPRECATED.\n\n{description}"
        return {**self.path_info, "description": description}


def get_apis(open_api_spec, tag):
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
    for endpoint in endpoints:
        if endpoint.identifying_tag == tag:
            paths_dict[endpoint.url][endpoint.method] = endpoint.serialize()
            used_entity_refs |= set(endpoint.schemas)
    # Create the final list of all schemas used by the matching endpoints
    used_entity_names = [schema_ref.split("/")[-1] for schema_ref in used_entity_refs]
    used_schemas = {
        name: open_api_spec["components"]["schemas"][name] for name in used_entity_names
    }
    return {
        **open_api_spec,
        "components": {
            **open_api_spec["components"],
            "schemas": used_schemas,
        },
        "paths": paths_dict,
    }


if __name__ == "__main__":
    # If running this script, actually output the new open api spec
    open_api_spec = requests.get("https://api.onefootprint.com/docs-spec-v3").json()
    os.makedirs("out", exist_ok=True)
    public_open_api_spec = get_apis(open_api_spec, "PublicApi")
    with open("out/API Docs.json", "w") as f:
        f.write(json.dumps(public_open_api_spec))
        f.close()
    preview_open_api_spec = get_apis(open_api_spec, "Preview")
    os.makedirs("out", exist_ok=True)
    with open("out/API Preview Docs.json", "w") as f:
        f.write(json.dumps(preview_open_api_spec))
        f.close()
