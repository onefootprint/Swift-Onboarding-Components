from tests.utils import get, post, _gen_random_sandbox_id
from tests.identify_client import IdentifyClient
from tests.constants import FIXTURE_PHONE_NUMBER, FIXTURE_EMAIL
from tests.headers import SandboxId
from tests.bifrost_client import BifrostClient


def test_portablize_nypid_via_auth(sandbox_tenant, foo_sandbox_tenant, auth_playbook):
    """
    Portablize a vault created via API at sandbox_tenant by onboarding onto an auth playbook.
    Then onboard the user onto foo_sandbox_tenant and ensure the data was prefilled
    """
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    # This data is slightly different from that in constants.py
    initial_data = {
        "id.first_name": "Nonportable",
        "id.last_name": "Penguin",
        "id.address_line1": "1 Hayes St",
        "id.city": "San Francisco",
        "id.state": "CA",
        "id.zip": "94117",
        "id.country": "US",
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": FIXTURE_EMAIL,
    }
    post("users", initial_data, sandbox_tenant.s_sk, sandbox_id_h)

    # Assert only an SMS challenge is available to portablize the NYPID since we want them to
    # verify their phone number over their email
    data = dict(identifier=dict(phone_number=FIXTURE_PHONE_NUMBER))
    body = post("hosted/identify", data, sandbox_id_h, auth_playbook.key)
    assert body["user_found"]
    assert body["available_challenge_kinds"] == ["sms"]

    # Log into the user with an auth playbook, which will portablize it
    IdentifyClient(auth_playbook.key, sandbox_id).inherit(scope="auth")

    # Now, when one-click onboarding onto another tenant, we should prefill this data instead of
    # using the data that is filled in by the Bifrost client
    bifrost = BifrostClient.inherit(foo_sandbox_tenant.default_ob_config, sandbox_id)
    user = bifrost.run()
    # Double check the data was prefilled
    body = get(f"entities/{user.fp_id}", None, *foo_sandbox_tenant.db_auths)
    assert all(
        d["source"] == "prefill"
        for d in body["data"]
        if d["identifier"] in initial_data
    )

    data = dict(fields=[k for k in initial_data], reason="Foobar")
    body = post(
        f"entities/{user.fp_id}/vault/decrypt", data, *foo_sandbox_tenant.db_auths
    )
    assert all(body[k] == v for k, v in initial_data.items())


def test_portablize_nypid_via_kyc(sandbox_tenant, foo_sandbox_tenant):
    """
    Portablize a vault created via API at sandbox_tenant by onboarding onto a KYC playbook.
    Then onboard the user onto foo_sandbox_tenant and ensure the data was prefilled
    """
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    # This data is slightly different from that in constants.py
    initial_data = {
        "id.first_name": "Nonportable",
        "id.last_name": "Penguin",
        "id.address_line1": "1 Hayes St",
        "id.city": "San Francisco",
        "id.state": "CA",
        "id.zip": "94117",
        "id.country": "US",
        "id.phone_number": FIXTURE_PHONE_NUMBER,
        "id.email": FIXTURE_EMAIL,
    }
    post("users", initial_data, sandbox_tenant.s_sk, sandbox_id_h)

    # Inherit the user and run them through a KYC playbook
    bifrost = BifrostClient.inherit(sandbox_tenant.default_ob_config, sandbox_id)
    bifrost.run()

    # Now, when one-click onboarding onto another tenant, we should prefill this data instead of
    # using the data that is filled in by the Bifrost client
    bifrost = BifrostClient.inherit(foo_sandbox_tenant.default_ob_config, sandbox_id)
    user = bifrost.run()
    # Double check the data was prefilled
    body = get(f"entities/{user.fp_id}", None, *foo_sandbox_tenant.db_auths)
    assert all(
        d["source"] == "prefill"
        for d in body["data"]
        if d["identifier"] in initial_data
    )

    data = dict(fields=[k for k in initial_data], reason="Foobar")
    body = post(
        f"entities/{user.fp_id}/vault/decrypt", data, *foo_sandbox_tenant.db_auths
    )
    assert all(body[k] == v for k, v in initial_data.items())
