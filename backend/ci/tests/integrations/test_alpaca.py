from tests.constants import FIXTURE_PHONE_NUMBER
from tests.utils import _gen_random_n_digit_number, create_sandbox_user
from tests.utils import post

from alpaca.broker.client import BrokerClient
from alpaca.broker.requests import (
    CreateAccountRequest,
    Contact,
    Identity,
    Disclosures,
    Agreement,
)
from alpaca.broker.enums import AgreementType
import datetime

ALPACA_SANDBOX_API_KEY = "CK9ANXZG595Q7CHXAXX3"
ALPACA_SANDBOX_API_SECRET = "WBJf7VgZmE0oFBdFFCItK49p41jwpdLX9tcg9gsV"


def test_alpaca_cip(sandbox_tenant, twilio):
    # create a new user that has onboarded
    user = create_sandbox_user(sandbox_tenant, twilio)
    d = user.client.data

    # create a new alpaca account
    broker_client = BrokerClient(ALPACA_SANDBOX_API_KEY, ALPACA_SANDBOX_API_SECRET)

    alpaca_account_email_num = _gen_random_n_digit_number(10)

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
    body = post("integrations/alpaca_cip", alpaca_data, sandbox_tenant.sk.key)

    assert body["status_code"] == 200
    assert body["alpaca_response"]

    # retrieve cip from alpaca
    broker_client.get_cip_data_for_account_by_id(account_id=account.id)

    assert body["alpaca_response"]["id"]
    assert body["alpaca_response"]["kyc"]["applicant_name"] == "Carl Cassanova"
