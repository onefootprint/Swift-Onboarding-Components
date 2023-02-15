from tests.constants import SVIX_AUTH_TOKEN
from tests.utils import EXPECTED_SERVER_VERSION_GIT_HASH, HttpError, create_sandbox_user
from tests.utils import get
import requests
from svix.api import Svix, ApplicationIn, EndpointIn
import random, string

# creates a random channel for us to test webhooks on via hooky.footprint.dev
def create_hooky_url():
    random_hook = "".join(random.choices(string.ascii_letters + string.digits, k=20))
    return f"https://hooky.footprint.dev/fp_integ_{random_hook}"


def test_webhook_e2e(sandbox_tenant, twilio):
    # 1. get the svix app id
    body = get("org/webhook_portal", None, sandbox_tenant.sk.key)
    assert body["url"]
    assert body["app_id"]
    app_id = body["app_id"]

    # 2. register a webhook for testing
    svix = Svix(SVIX_AUTH_TOKEN)
    app = svix.application.get_or_create(
        ApplicationIn(name=sandbox_tenant.name, uid=sandbox_tenant.id)
    )
    assert app.id == app_id  # ensure that we're creating app id's in svix properly

    hooky_url = create_hooky_url()
    channels = (
        [EXPECTED_SERVER_VERSION_GIT_HASH] if EXPECTED_SERVER_VERSION_GIT_HASH else None
    )
    svix.endpoint.create(
        app.id, EndpointIn(url=hooky_url, version=1, channels=channels)
    )

    # 3. fire off a codepath that triggers the webhook (i.e. an onboarding)
    user = create_sandbox_user(sandbox_tenant, twilio)

    # 4. Retrieve the webhook message and make sure it's correct
    response = requests.get(hooky_url)
    if response.status_code != 200:
        raise HttpError(
            response.status_code,
            f"Invalid response from hooky.footprint.dev: {response.content}",
        )
    body = response.json()

    assert body["footprint_user_id"] == user.fp_user_id
    assert body["status"] == "pass"
