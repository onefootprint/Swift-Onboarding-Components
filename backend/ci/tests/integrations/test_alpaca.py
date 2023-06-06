import pytest
from tests.auth import DashboardAuthIsLive
from tests.bifrost_client import BifrostClient
from tests.utils import create_ob_config
from tests.constants import FIXTURE_PHONE_NUMBER
from tests.utils import _gen_random_n_digit_number, create_sandbox_user
from tests.utils import post
import uuid
from alpaca.broker.client import BrokerClient
from alpaca.broker.requests import (
    CreateAccountRequest,
    Contact,
    Identity,
    Disclosures,
    Agreement,
    AccountDocument
)
from alpaca.broker.enums import AgreementType
import datetime

ALPACA_SANDBOX_API_KEY = "CK9ANXZG595Q7CHXAXX3"
ALPACA_SANDBOX_API_SECRET = "WBJf7VgZmE0oFBdFFCItK49p41jwpdLX9tcg9gsV"


@pytest.fixture(scope="session")
def alpaca_kyc_ob_config(sandbox_tenant, must_collect_data, can_access_data):
    return create_ob_config(
        sandbox_tenant,
        "Alpaca",
        must_collect_data,
        can_access_data,
        "alpaca"
    )

@pytest.mark.parametrize(
    "sandbox_suffix,expected_error",
    [
        ("pass", None),
        ("manualreview", None),
        ("stepup", None),
        ("fail", "The entity must have an approved decision status")
    ],
)
def test_alpaca_cip(sandbox_tenant, twilio, alpaca_kyc_ob_config, sandbox_suffix, expected_error):
    # create a new user that has onboarded
    bifrost = BifrostClient(alpaca_kyc_ob_config, twilio, sandbox_suffix=sandbox_suffix)
    user = bifrost.run()
    d = user.client.data
    
    review_annotation = None
    if sandbox_suffix == "stepup":
        review_annotation = "Documentary identity verification was manually conducted and approved"
    elif sandbox_suffix == "manualreview":
        review_annotation = "Watchlist deemed false-positive"

    if review_annotation:
        post(
            f"entities/{user.fp_id}/decisions",
            dict(
                annotation=dict(note=review_annotation, is_pinned=False),
                status="pass",
            ),
            sandbox_tenant.auth_token,
            DashboardAuthIsLive("false"),
        )

    # create a new alpaca account
    broker_client = BrokerClient(ALPACA_SANDBOX_API_KEY, ALPACA_SANDBOX_API_SECRET)

    alpaca_account_email_num = _gen_random_n_digit_number(10)

    documents = None
    # If we colleted doc, then we will send that in the create Alpaca account request too
    if sandbox_suffix == "stepup":
        documents = []
        for side in ["front", "back", "selfie"]:
         documents.append(AccountDocument(
            id=uuid.uuid4(), # this shouldn't really be necessary but this python client doesn't list `id` as optional
            document_type="identity_verification",
            document_sub_type="drivers_license",
            content=d[f"document.drivers_license.{side}"],
            mime_type="image/png"
        ))
    
    account = broker_client.create_account(
        CreateAccountRequest(
            contact=Contact(
                email_address=f"footprint.user.dev+{alpaca_account_email_num}@gmail.com",
                phone_number=FIXTURE_PHONE_NUMBER,
                city=d["id.city"],
                country=d["id.country"],
                postal_code=d["id.zip"],
                state=d["id.state"],
                street_address=[d["id.address_line1"]],
            ),
            identity=Identity(
                given_name=d["id.first_name"],
                family_name=d["id.last_name"],
                date_of_birth=d["id.dob"],
                country_of_tax_residence="USA",
            ),
            documents=documents,
            disclosures=Disclosures(
                immediate_family_exposed=False,
                is_politically_exposed=False,
                is_control_person=False,
                is_affiliated_exchange_or_finra=False,
            ),
            agreements=[
                Agreement(
                    agreement=AgreementType.ACCOUNT,
                    signed_at=datetime.datetime.now(
                        tz=datetime.timezone.utc
                    ).isoformat(),
                    ip_address="127.0.0.1",
                ),
                Agreement(
                    agreement=AgreementType.CUSTOMER,
                    signed_at=datetime.datetime.now(
                        tz=datetime.timezone.utc
                    ).isoformat(),
                    ip_address="127.0.0.1",
                ),
                Agreement(
                    agreement=AgreementType.MARGIN,
                    signed_at=datetime.datetime.now(
                        tz=datetime.timezone.utc
                    ).isoformat(),
                    ip_address="127.0.0.1",
                ),
            ],
        )
    )

    # alpaca request
    alpaca_data = {
        "fp_user_id": user.fp_id,
        "api_key": ALPACA_SANDBOX_API_KEY,
        "api_secret": ALPACA_SANDBOX_API_SECRET,
        "hostname": "broker-api.sandbox.alpaca.markets",
        # taken from our sandbox account
        "account_id": f"{account.id}",
        "default_approver": "bob@boberto.com",
    }
    
    # send cip
    body = post("integrations/alpaca_cip", alpaca_data, sandbox_tenant.sk.key, status_code=200 if expected_error is None else 400)
    if expected_error:
        assert body["error"]["message"] == expected_error
    else:
        assert body["alpaca_response"]

        # retrieve cip from alpaca
        broker_client.get_cip_data_for_account_by_id(account_id=account.id)

        assert body["alpaca_response"]["id"]
        assert (
            body["alpaca_response"]["kyc"]["applicant_name"]
            == f"{d['id.first_name']} {d['id.last_name']}"
        )


# TODO: Test scenarios to add
# - FP failure, no manual review
# - FP failure, then manual review pass
# - FP failure, manual review fail.
# - FP failure, manual review pass -> then manual review fail
