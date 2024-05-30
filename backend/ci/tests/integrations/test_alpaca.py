import pytest
from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config
from tests.utils import _gen_random_n_digit_number, _gen_random_sandbox_id
from tests.utils import post, get
from alpaca.broker.client import BrokerClient
import datetime
from enum import Enum, auto

ALPACA_SANDBOX_API_KEY = "CK9ANXZG595Q7CHXAXX3"
ALPACA_SANDBOX_API_SECRET = "WBJf7VgZmE0oFBdFFCItK49p41jwpdLX9tcg9gsV"


def alpaca_kyc_ob_config(sandbox_tenant, must_collect_data):
    return create_ob_config(
        sandbox_tenant,
        "Alpaca",
        must_collect_data,
        must_collect_data,
        "alpaca",
        enhanced_aml={
            "enhanced_aml": True,
            "ofac": True,
            "pep": True,
            "adverse_media": True,
        },
    )


class NationalityConfig(Enum):
    UsLegalStatusCitizen = (
        auto()
    )  # Tenant is configured to collect UseLegalStatus and the user is a citizen
    UsLegalStatusPermanentResidence = (
        auto()
    )  # Tenant is configured to collect UseLegalStatus and the user is not a citizen
    Nationality = auto()  # Tenant is configured to collect Nationality
    Neither = (
        auto()
    )  # Tenant is not configured to collect either Nationality or UsLegalStatus (like Bloom)


def cdos_for_nationality_config(nationality_config):
    # oh man our CLI is still python 3.9 which doesnt support match statements
    if (
        nationality_config == NationalityConfig.UsLegalStatusCitizen
        or nationality_config == NationalityConfig.UsLegalStatusPermanentResidence
    ):
        return ["us_legal_status"]
    elif nationality_config == NationalityConfig.Nationality:
        return ["nationality"]
    elif nationality_config == NationalityConfig.Neither:
        return []


@pytest.skip(allow_module_level=True)
@pytest.mark.parametrize(
    "nationality_config",
    [
        (NationalityConfig.UsLegalStatusCitizen),
        (NationalityConfig.UsLegalStatusPermanentResidence),
        (NationalityConfig.Nationality),
        # (NationalityConfig.Neither), We no longer intentionally support this now that Alpaca is making it more clear that it is required.
    ],
)
@pytest.mark.parametrize(
    "sandbox_outcome,manually_mark_as_verified,expected_error",
    [
        ("pass", False, None),
        ("manual_review", True, None),
        ("step_up", True, None),
        (
            "fail",
            True,
            None,
        ),  # weird case where the user hard failed, but the Tenant still marked them as passed and we allow them to make the CIP call
        ("fail", False, "The entity must have an approved decision status"),
    ],
)
def test_alpaca_cip(
    sandbox_tenant,
    sandbox_outcome,
    manually_mark_as_verified,
    expected_error,
    nationality_config,
):
    # create a new user that has onboarded
    # Alpaca doesn't allow duplicate emails, so we create a nonce'd one
    sandbox_id = _gen_random_sandbox_id()
    email = f"footprint.user.dev.{_gen_random_n_digit_number(10)}@gmail.com"
    obc = alpaca_kyc_ob_config(
        sandbox_tenant,
        [
            "name",
            "ssn9",
            "full_address",
            "email",
            "phone_number",
            "dob",
            "investor_profile",
        ]
        + cdos_for_nationality_config(nationality_config),
    )
    bifrost = BifrostClient.new_user(
        obc,
        override_sandbox_id=sandbox_id,
        override_email=email,
        fixture_result=sandbox_outcome,
    )
    bifrost.vault_barcode_with_doc = False  # hack cause /vault barfs when trying to vault barcode during stepup because stepup workflow state only gives the AddDocument guard, not the AddData guard

    # handle nationality option
    expected_nationality = None
    if nationality_config == NationalityConfig.UsLegalStatusCitizen:
        bifrost.data.pop("id.nationality")
        bifrost.data["id.us_legal_status"] = "citizen"
        expected_nationality = "US"
    elif nationality_config == NationalityConfig.UsLegalStatusPermanentResidence:
        bifrost.data["id.us_legal_status"] = "permanent_resident"
        bifrost.data["id.nationality"] = "ZA"
        bifrost.data["id.citizenships"] = ["ZA"]
        expected_nationality = "ZA"
    elif nationality_config == NationalityConfig.Nationality:
        bifrost.data["id.nationality"] = "ZA"
        expected_nationality = "ZA"
    elif nationality_config == NationalityConfig.Neither:
        pass

    user = bifrost.run()
    d = user.client.data

    review_annotation = None
    if manually_mark_as_verified:
        review_annotation = "Piip is very trustworthy"  # extra annotation should not be included in the CIP response unless there is no manual review (ie Tenant marked a hard Fail user as verified)

    if review_annotation:
        # Complete review
        post(
            f"entities/{user.fp_id}/decisions",
            dict(
                annotation=dict(note=review_annotation, is_pinned=False),
                status="pass",
            ),
            *sandbox_tenant.db_auths,
        )
        # Check that the timeline event for the completed review has correct review_reasons as well
        timeline = get(
            f"entities/{user.fp_id}/timeline", None, *sandbox_tenant.db_auths
        )
        if sandbox_outcome == "stepup":
            expected_review_reasons = [
                {
                    "review_reason": "document",
                    "canned_response": "Document identity verification was manually conducted and approved",
                }
            ]
        elif sandbox_outcome == "manualreview":
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
        else:  # "fail"
            expected_review_reasons = None
        if expected_review_reasons:
            assert (
                timeline[0]["event"]["data"]["decision"]["manual_review"][
                    "review_reasons"
                ]
                == expected_review_reasons
            )

    # Create Alpaca Account
    create_account_data = {
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
            }
        ],
    }

    create_account_res = post(
        f"users/{user.fp_id}/integrations/alpaca/account",
        create_account_data,
        sandbox_tenant.sk.key,
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
    declarations = d["investor_profile.declarations"]
    assert alpaca_response["disclosures"] == {
        "is_control_person": "senior_executive" in declarations,
        "is_affiliated_exchange_or_finra": "affiliated_with_us_broker" in declarations,
        "is_politically_exposed": "senior_political_figure" in declarations,
        "immediate_family_exposed": "family_of_political_figure" in declarations,
        "is_discretionary": False,
        "is_affiliated_exchange_or_iiroc": None,  # idk why they return this now and its not in their docs
    }

    account_id = alpaca_response["id"]

    # alpaca request
    alpaca_data = {
        "api_key": ALPACA_SANDBOX_API_KEY,
        "api_secret": ALPACA_SANDBOX_API_SECRET,
        "hostname": "broker-api.sandbox.alpaca.markets",
        # taken from our sandbox account
        "account_id": f"{account_id}",
        "default_approver": "bob@boberto.com",
    }

    # send cip
    body = post(
        f"users/{user.fp_id}/integrations/alpaca/cip",
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

        assert body["alpaca_response"]["kyc"]["nationality"] == expected_nationality

        expected_approved_reason = None
        if sandbox_outcome == "stepup":
            expected_approved_reason = (
                "Document identity verification was manually conducted and approved"
            )
        elif sandbox_outcome == "manualreview":
            expected_approved_reason = "Adverse media hit deemed non-detrimental. Watchlist hit deemed low risk or false-positive"
        elif sandbox_outcome == "fail":
            expected_approved_reason = review_annotation

        if expected_approved_reason:
            assert (
                body["alpaca_response"]["kyc"]["approved_reason"]
                == expected_approved_reason
            )
            # extra check that we aren't sending the internal/non-CR annotations in the CIP
            if expected_approved_reason != review_annotation:
                assert review_annotation not in str(body["alpaca_response"])

        # sanity check that we aren't accidently scrubbing PII in the alpaca CIP
        assert "SCRUBBED" not in str(body["alpaca_response"])

        # Make sure we have a timeline event for external integration being called
        body = get(f"entities/{user.fp_id}/timeline", None, *sandbox_tenant.db_auths)
        cip_api_events = [
            i["event"]["data"]["kind"]
            for i in body
            if i["event"]["kind"] == "external_integration_called"
        ]
        assert cip_api_events == ["alpaca_cip"]


# TODO: Test scenarios to add
# - FP failure, no manual review
# - FP failure, then manual review pass
# - FP failure, manual review fail.
# - FP failure, manual review pass -> then manual review fail
