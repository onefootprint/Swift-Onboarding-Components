import pytest
import multiprocessing
from tests.constants import IT_SVIX_API_KEY, ENVIRONMENT
from tests.utils import get
from tests.bifrost_client import BifrostClient
from svix.api import Svix, ApplicationIn, EndpointIn


def check_webhook(hooky_url, webhook_fpids):
    import requests

    while True:
        response = requests.get(hooky_url)
        if response.status_code != 200:
            raise Exception(
                f"Invalid response from hooky.footprint.dev: HTTP {response.status_code}\n{response.content}",
            )
        body = response.json()
        fp_id = body["fp_id"]
        print(f"Webhook received {fp_id}")
        webhook_fpids.append(fp_id)


@pytest.mark.skipif(
    ENVIRONMENT == "ephemeral",
    reason="Cannot leak svix key in integration tests environment",
)
@pytest.mark.flaky
def test_webhook_e2e(sandbox_tenant, run_id):
    if ENVIRONMENT not in ("production", "dev"):
        # When using the local svix environment, register specifically a new webhook URL for each integration
        # test run
        body = get("org/webhook_portal", None, *sandbox_tenant.db_auths)
        assert body["url"]
        assert body["app_id"]
        app_id = body["app_id"]

        svix = Svix(IT_SVIX_API_KEY)
        app = svix.application.get_or_create(
            ApplicationIn(
                name=f"{sandbox_tenant.name} ( Sandbox)",
                uid=f"{sandbox_tenant.id}_sandbox",
            )
        )
        assert app.id == app_id  # ensure that we're creating app id's in svix properly
        print(f"APP ID: {app.id}")

        # Remove existing endpoints in svix from previous integration testing runs
        endpoints = svix.endpoint.list(app.id)
        hooky_url = f"https://hooky.footprint.dev/fp_integ_{run_id}"
        endpoints = svix.endpoint.list(app_id)
        for endpoint in endpoints.data:
            print(f"Deleting svix endpoint {endpoint.id}")
            svix.endpoint.delete(app.id, endpoint.id)

        print(f"Num endpoints: {len(endpoints.data)}")
        endpoint = svix.endpoint.create(app.id, EndpointIn(url=hooky_url, version=1))
    else:
        # Use an environment-specific webhook callback URL. These have been manually configured in the SVIX UI
        hooky_url = f"https://hooky.footprint.dev/fp_integ_{ENVIRONMENT}"

    # Start a background process to read all the fp_ids sent to hooky
    manager = multiprocessing.Manager()
    webhook_fpids = manager.list()
    p = multiprocessing.Process(target=check_webhook, args=(hooky_url, webhook_fpids))
    p.start()

    # Fire off a codepath that triggers the webhook (i.e. an onboarding)
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost.run()

    # Retrieve the webhook message and make sure it's correct
    # we expect 3 webhooks, 1 OnboardingStatusChanged from incomplete -> pending. Then an OnboardingCompleted and another OnboardingStatusChanged from pending -> pass
    # TODO but we stopped testing ^
    p.join(60)
    p.terminate()
    assert (
        user.fp_id in webhook_fpids
    ), f"""Couldn't find {user.fp_id} in {",".join(list(webhook_fpids))}"""

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
