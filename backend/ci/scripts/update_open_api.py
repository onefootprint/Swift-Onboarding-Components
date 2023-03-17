import os
import json
import requests

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

    def serialize(self):
        """
        Serializes the Endpoint back into open-api JSON path info
        """
        description = self.path_info["description"]
        if self.identifying_tag == "Preview":
            description = f"This is a preview API. By using this, you consent to potentially breaking API changes.\n{description}"
        return {**self.path_info, "description": description}


def get_apis(open_api_spec, tag):
    """
    Replace the paths in the open API spec with only the public paths, and validate the tags for
    each endpoint.
    """
    # Parse paths
    paths = {
        url: {
            method: Endpoint(url, method, path_info)
            for method, path_info in methods_for_url.items()
        }
        for (url, methods_for_url) in open_api_spec["paths"].items()
    }
    # Filter out the endpoints that do not have a public tag
    public_paths = {
        url: {
            method: endpoint.serialize()
            for (method, endpoint) in methods_for_url.items()
            if endpoint.identifying_tag == tag
        }
        for (url, methods_for_url) in paths.items()
    }
    # Filter out empty URLs
    public_paths = {
        url: methods_for_url
        for (url, methods_for_url) in public_paths.items()
        if methods_for_url
    }
    # TODO filter out entities not used in public APIs?
    return {
        **open_api_spec,
        "paths": public_paths,
    }


if __name__ == "__main__":
    # If running this script, actually output the new open api spec
    open_api_spec = requests.get("https://api.onefootprint.com/docs-spec-v3").json()
    os.makedirs("out", exist_ok=True)
    public_open_api_spec = get_apis(open_api_spec, "PublicApi")
    with open("out/API.json", "w") as f:
        f.write(json.dumps(public_open_api_spec))
        f.close()
    preview_open_api_spec = get_apis(open_api_spec, "Preview")
    os.makedirs("out", exist_ok=True)
    with open("out/API Preview.json", "w") as f:
        f.write(json.dumps(preview_open_api_spec))
        f.close()
