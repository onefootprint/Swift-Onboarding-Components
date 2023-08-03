from tests.constants import SVIX_AUTH_TOKEN
from tests.utils import EXPECTED_SERVER_VERSION_GIT_HASH, HttpError
from tests.utils import get
from tests.bifrost_client import BifrostClient
import requests
from svix.api import Svix, ApplicationIn, EndpointIn
import random, string


# creates a random channel for us to test webhooks on via hooky.footprint.dev
def create_hooky_url():
    random_hook = "".join(random.choices(string.ascii_letters + string.digits, k=20))
    return f"https://hooky.footprint.dev/fp_integ_{random_hook}"


def get_latest_webhook(hooky_url):
    response = requests.get(hooky_url)
    if response.status_code != 200:
        raise HttpError(
            response.status_code,
            f"Invalid response from hooky.footprint.dev: {response.content}",
        )
    return response.json()


def test_webhook_e2e(sandbox_tenant, twilio):
    # 1. get the svix app id
    body = get("org/webhook_portal", None, *sandbox_tenant.db_auths)
    assert body["url"]
    assert body["app_id"]
    app_id = body["app_id"]

    # 2. register a webhook for testing
    svix = Svix(SVIX_AUTH_TOKEN)
    app = svix.application.get_or_create(
        ApplicationIn(
            name=f"{sandbox_tenant.name} ( Sandbox)", uid=f"{sandbox_tenant.id}_sandbox"
        )
    )
    assert app.id == app_id  # ensure that we're creating app id's in svix properly
    print(f"APP ID: {app.id}")

    hooky_url = create_hooky_url()
    channels = (
        [EXPECTED_SERVER_VERSION_GIT_HASH] if EXPECTED_SERVER_VERSION_GIT_HASH else None
    )
    endpoints = svix.endpoint.list(app_id)
    print(f"Num endpoints: {len(endpoints.data)}")
    endpoint = svix.endpoint.create(
        app.id, EndpointIn(url=hooky_url, version=1, channels=channels)
    )

    # 3. fire off a codepath that triggers the webhook (i.e. an onboarding)
    bifrost = BifrostClient.new(sandbox_tenant.default_ob_config, twilio)
    user = bifrost.run()

    # 4. Retrieve the webhook message and make sure it's correct
    # we expect 3 webhooks, 1 OnboardingStatusChanged from incomplete -> pending. Then an OnboardingCompleted and another OnboardingStatusChanged from pending -> pass

    # TODO: need to make hooky support storing a buffer of webhooks, for now just assert that at least 1 webhook was fired
    webhook = get_latest_webhook(hooky_url)
    assert webhook["fp_id"] == user.fp_id

    # webhooks = sorted([get_latest_webhook(hooky_url) for _ in range(3)], key=lambda w: w['timestamp'])
    # webhook1 = webhooks[0]
    # print(f"Webhook 1: {webhook1}")
    # assert webhook1["fp_id"] == user.fp_id
    # assert webhook1["new_status"] == "pending"

    # webhook2 = webhooks[1]
    # print(f"Webhook 2: {webhook2}")

    # webhook3 = webhooks[2]
    # print(f"Webhook 3: {webhook3}")
    # assert webhook2["fp_id"] == user.fp_id
    # assert webhook2["status"] == "pass"
    # assert webhook2["requires_manual_review"] == False

    # assert webhook3["fp_id"] == user.fp_id
    # assert webhook3["new_status"] == "pass"

    # cleanup
    svix.endpoint.delete(app.id, endpoint.id)
