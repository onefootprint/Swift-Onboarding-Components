import json
import requests

# Every API endpoint must have only one of these tag values
IDENTIFYING_TAG_VALUES = ["Private", "PublicApi", "Hosted", "Preview"]


def is_public_api(method, url, tags):
    identifying_tags = set(tags) & set(IDENTIFYING_TAG_VALUES)
    # Enforce that every API has one and only one "identifying tag"
    assert (
        identifying_tags
    ), f"{method.upper()} {url} doesn't have an identifying tag: {tags}"
    assert (
        len(identifying_tags) == 1
    ), f"{method.upper()} {url} has more than one identifying tags: {tags}"
    return next(iter(identifying_tags)) == "PublicApi"


def get_public_apis(open_api_spec):
    """
    Replace the paths in the open API spec with only the public paths, and validate the tags for
    each endpoint.
    """
    # Filter out the paths that do not have a public tag
    # TODO add preview APIs in with a disclaimer here
    public_paths = {
        url: {
            method: path_info
            for method, path_info in methods_for_url.items()
            if is_public_api(method, url, path_info["tags"])
        }
        for (url, methods_for_url) in open_api_spec["paths"].items()
    }
    # Filter out URLs that have no public paths
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
    get_public_apis(open_api_spec)
    with open("out/public-api.json", "w") as f:
        f.write(json.dumps(open_api_spec))
        f.close()
