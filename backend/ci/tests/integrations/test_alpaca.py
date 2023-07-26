import pytest
from tests.headers import IsLive
from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config
from tests.utils import _gen_random_n_digit_number
from tests.utils import post, get
from tests.constants import FIXTURE_PHONE_NUMBER
import json
from alpaca.broker.client import BrokerClient
import datetime

ALPACA_SANDBOX_API_KEY = "CK9ANXZG595Q7CHXAXX3"
ALPACA_SANDBOX_API_SECRET = "WBJf7VgZmE0oFBdFFCItK49p41jwpdLX9tcg9gsV"


@pytest.fixture(scope="session")
def alpaca_kyc_ob_config(sandbox_tenant, must_collect_data, can_access_data):
    return create_ob_config(
        sandbox_tenant,
        "Alpaca",
        must_collect_data + ["investor_profile"],
        can_access_data + ["investor_profile"],
        "alpaca",
    )


@pytest.mark.parametrize(
    "sandbox_outcome,expected_error",
    [
        ("pass", None),
        ("manualreview", None),
        ("stepup", None),
        ("fail", "The entity must have an approved decision status"),
    ],
)
@pytest.mark.skip(reason="alpaca currently 422ing for us")
def test_alpaca_cip(
    sandbox_tenant, twilio, alpaca_kyc_ob_config, sandbox_outcome, expected_error
):
    # create a new user that has onboarded
    # Alpaca doesn't allow duplicate emails, so we create a nonce'd one
    seed = _gen_random_n_digit_number(10)
    sandbox_id = f"{sandbox_outcome}{seed}"
    email = f"footprint.user.dev.{_gen_random_n_digit_number(10)}@gmail.com"
    bifrost = BifrostClient.create(
        alpaca_kyc_ob_config,
        twilio,
        FIXTURE_PHONE_NUMBER,
        sandbox_id,
        override_email=email,
    )
    user = bifrost.run()
    d = user.client.data

    review_annotation = None
    if sandbox_outcome == "stepup" or sandbox_outcome == "manualreview":
        review_annotation = "Piip is very trustworthy"  # extra annotation should not be included in the CIP response

    if review_annotation:
        # Check that the review_reasons are correctly populated in /entities for showing in the review UI
        entities_body = get(
            f"entities/{user.fp_id}",
            None,
            sandbox_tenant.auth_token,
            IsLive("false"),
        )
        # Complete review
        post(
            f"entities/{user.fp_id}/decisions",
            dict(
                annotation=dict(note=review_annotation, is_pinned=False),
                status="pass",
            ),
            sandbox_tenant.auth_token,
            IsLive("false"),
        )
        # Check that the timeline event for the completed review has correct review_reasons as well
        timeline = get(
            f"entities/{user.fp_id}/timeline",
            None,
            sandbox_tenant.auth_token,
            IsLive("false"),
        )
        if sandbox_outcome == "stepup":
            expected_review_reasons = [
                {
                    "review_reason": "document",
                    "canned_response": "Document identity verification was manually conducted and approved",
                }
            ]
        else:
            expected_review_reasons = [
                {
                    "review_reason": "adverse_media_hit",
                    "canned_response": "Adverse media hit deemed non-detrimental",
                },
                {
                    "review_reason": "watchlist_hit",
                    "canned_response": "Watchlist hit deemed low risk or false-positive",
                },
            ]
        assert (
            entities_body["onboarding"]["manual_review"]["review_reasons"]
            == expected_review_reasons
        )
        assert (
            timeline[0]["event"]["data"]["decision"]["manual_review"]["review_reasons"]
            == expected_review_reasons
        )

    # Create Alpaca Account
    create_account_data = {
        "fp_user_id": user.fp_id,
        "api_key": ALPACA_SANDBOX_API_KEY,
        "api_secret": ALPACA_SANDBOX_API_SECRET,
        "hostname": "broker-api.sandbox.alpaca.markets",
        "enabled_assets": ["us_equity"],
        "agreements": [
            {
                "agreement": "customer_agreement",
                "signed_at": datetime.datetime.now(
                    tz=datetime.timezone.utc
                ).isoformat(),
                "ip_address": "127.0.0.1",
            },
            {
                "agreement": "crypto_agreement",
                "signed_at": datetime.datetime.now(
                    tz=datetime.timezone.utc
                ).isoformat(),
                "ip_address": "127.0.0.1",
            },
        ],
    }

    create_account_res = post(
        "integrations/alpaca/account", create_account_data, sandbox_tenant.sk.key
    )
    assert create_account_res["status_code"] == 200
    alpaca_response = create_account_res["alpaca_response"]
    assert alpaca_response["contact"]["email_address"] == d["id.email"].split("#")[0]
    assert (
        alpaca_response["contact"]["phone_number"] == d["id.phone_number"].split("#")[0]
    )
    assert alpaca_response["identity"]["given_name"] == d["id.first_name"]
    assert alpaca_response["identity"]["family_name"] == d["id.last_name"]
    assert alpaca_response["identity"]["date_of_birth"] == d["id.dob"]
    declarations = json.loads(d["investor_profile.declarations"])
    assert alpaca_response["disclosures"] == {
        "is_control_person": "senior_executive" in declarations,
        "is_affiliated_exchange_or_finra": "affiliated_with_us_broker" in declarations,
        "is_politically_exposed": "senior_political_figure" in declarations,
        "immediate_family_exposed": "family_of_political_figure" in declarations,
        "is_discretionary": False,
    }

    account_id = alpaca_response["id"]

    # alpaca request
    alpaca_data = {
        "fp_user_id": user.fp_id,
        "api_key": ALPACA_SANDBOX_API_KEY,
        "api_secret": ALPACA_SANDBOX_API_SECRET,
        "hostname": "broker-api.sandbox.alpaca.markets",
        # taken from our sandbox account
        "account_id": f"{account_id}",
        "default_approver": "bob@boberto.com",
    }

    # send cip
    body = post(
        "integrations/alpaca/cip",
        alpaca_data,
        sandbox_tenant.sk.key,
        status_code=200 if expected_error is None else 400,
    )
    if expected_error:
        assert body["error"]["message"] == expected_error
    else:
        assert body["alpaca_response"]

        # retrieve cip from alpaca - not really sure what this is for, just an extra level of validation i guess?
        broker_client = BrokerClient(ALPACA_SANDBOX_API_KEY, ALPACA_SANDBOX_API_SECRET)
        broker_client.get_cip_data_for_account_by_id(account_id=account_id)

        assert body["alpaca_response"]["id"]
        assert (
            body["alpaca_response"]["kyc"]["applicant_name"]
            == f"{d['id.first_name']} {d['id.last_name']}"
        )

        expected_approved_reason = None
        if sandbox_outcome == "stepup":
            expected_approved_reason = (
                "Document identity verification was manually conducted and approved"
            )
        elif sandbox_outcome == "manualreview":
            expected_approved_reason = "Adverse media hit deemed non-detrimental. Watchlist hit deemed low risk or false-positive"

        if expected_approved_reason:
            assert (
                body["alpaca_response"]["kyc"]["approved_reason"]
                == expected_approved_reason
            )
            # extra check that we aren't sending the internal/non-CR annotations in the CIP
            assert review_annotation not in str(body["alpaca_response"])

        # sanity check that we aren't accidently scrubbing PII in the alpaca CIP
        assert "SCRUBBED" not in str(body["alpaca_response"])


# TODO: Test scenarios to add
# - FP failure, no manual review
# - FP failure, then manual review pass
# - FP failure, manual review fail.
# - FP failure, manual review pass -> then manual review fail
