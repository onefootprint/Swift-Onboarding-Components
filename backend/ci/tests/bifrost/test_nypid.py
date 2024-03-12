from tests.utils import get, post, _gen_random_sandbox_id
from tests.identify_client import IdentifyClient
from tests.constants import FIXTURE_PHONE_NUMBER, FIXTURE_EMAIL
from tests.headers import SandboxId
from tests.bifrost_client import BifrostClient

# This data is slightly different from that in constants.py
NONPORTABLE_DATA = {
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


def test_portablize_nypid_via_auth(sandbox_tenant, foo_sandbox_tenant, auth_playbook):
    """
    Portablize a vault created via API at sandbox_tenant by onboarding onto an auth playbook.
    Then onboard the user onto foo_sandbox_tenant and ensure the data was prefilled
    """
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    post("users", NONPORTABLE_DATA, sandbox_tenant.s_sk, sandbox_id_h)

    # Assert only an SMS challenge is available to portablize the NYPID since we want them to
    # verify their phone number over their email
    data = dict(identifier=dict(phone_number=FIXTURE_PHONE_NUMBER), scope="onboarding")
    body = post("hosted/identify", data, sandbox_id_h, auth_playbook.key)
    assert body["user"]
    assert set(i["kind"] for i in body["user"]["auth_methods"]) == {"phone", "email"}
    assert all(not i["is_verified"] for i in body["user"]["auth_methods"])

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
        if d["identifier"] in NONPORTABLE_DATA
    )

    data = dict(fields=[k for k in NONPORTABLE_DATA], reason="Foobar")
    body = post(
        f"entities/{user.fp_id}/vault/decrypt", data, *foo_sandbox_tenant.db_auths
    )
    assert all(body[k] == v for k, v in NONPORTABLE_DATA.items())


def test_portablize_nypid_via_kyc(sandbox_tenant, foo_sandbox_tenant):
    """
    Portablize a vault created via API at sandbox_tenant by onboarding onto a KYC playbook.
    Then onboard the user onto foo_sandbox_tenant and ensure the data was prefilled
    """
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    post("users", NONPORTABLE_DATA, sandbox_tenant.s_sk, sandbox_id_h)

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
        if d["identifier"] in NONPORTABLE_DATA
    )

    data = dict(fields=[k for k in NONPORTABLE_DATA], reason="Foobar")
    body = post(
        f"entities/{user.fp_id}/vault/decrypt", data, *foo_sandbox_tenant.db_auths
    )
    assert all(body[k] == v for k, v in NONPORTABLE_DATA.items())


def test_portablize_nypid_by_email_then_phone(sandbox_tenant, foo_sandbox_tenant):
    """
    Portablize a vault created via API at sandbox_tenant by onboarding onto a KYC playbook.
    Then onboard the user onto foo_sandbox_tenant and ensure the data was prefilled
    """
    sandbox_id = _gen_random_sandbox_id()
    sandbox_id_h = SandboxId(sandbox_id)
    post("users", NONPORTABLE_DATA, sandbox_tenant.s_sk, sandbox_id_h)

    # Inherit the user via email
    auth = IdentifyClient(sandbox_tenant.default_ob_config.key, sandbox_id).inherit(
        kind="email"
    )

    # Add a verified phone number
    data = dict(
        kind="phone", phone_number=FIXTURE_PHONE_NUMBER, action_kind="add_primary"
    )
    body = post("hosted/user/challenge", data, auth)
    challenge_token = body["challenge_token"]
    data = dict(challenge_token=challenge_token, challenge_response="000000")
    body = post("hosted/user/challenge/verify", data, auth)

    # And then run the user through bifrost
    bifrost = BifrostClient.raw_auth(sandbox_tenant.default_ob_config, auth, sandbox_id)
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
        if d["identifier"] in NONPORTABLE_DATA
    )

    data = dict(fields=[k for k in NONPORTABLE_DATA], reason="Foobar")
    body = post(
        f"entities/{user.fp_id}/vault/decrypt", data, *foo_sandbox_tenant.db_auths
    )
    assert all(body[k] == v for k, v in NONPORTABLE_DATA.items())
