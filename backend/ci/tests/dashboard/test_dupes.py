from tests.utils import (
    _gen_random_str,
    _gen_random_ssn,
    post,
    get,
    _gen_random_sandbox_id,
    patch,
)
from tests.constants import FIXTURE_PHONE_NUMBER
from tests.headers import SandboxId, IgnoreCardValidation
from tests.bifrost_client import BifrostClient
from tests.identify_client import IdentifyClient


def create_user(sk, email, name):
    data = {"id.email": email, "id.first_name": name}
    res = post("users/", data, sk)
    return res["id"]


def test_dupes(sandbox_tenant):
    email = f"boberttech_{_gen_random_str(5)}@boberto.com"
    fp_id1 = create_user(sandbox_tenant.s_sk, email, "Bob1")
    fp_id2 = create_user(sandbox_tenant.s_sk, email, "Bob2")
    live_fp_id = create_user(
        sandbox_tenant.l_sk, email, "Bob3"
    )  # a live vault shouldn't appear as a dupe for a sandbox vault
    create_user(
        sandbox_tenant.s_sk, f"bobertotech_{_gen_random_str(5)}@boberto.com", "Bob4"
    )

    # Create a user with the same email who didn't finish the signup challenge. We shouldn't find
    # this user
    data = dict(
        email=dict(value=email),
        phone_number=dict(value=FIXTURE_PHONE_NUMBER),
        scope="onboarding",
        challenge_kind="sms",
    )
    obc = sandbox_tenant.default_ob_config
    sandbox_id = _gen_random_sandbox_id()
    post("hosted/identify/signup_challenge", data, obc.key, SandboxId(sandbox_id))

    # Create another user that finished onboarding entirely
    sandbox_id = _gen_random_sandbox_id()
    auth_token = IdentifyClient(obc, sandbox_id, email=email).create_user()
    bifrost = BifrostClient(obc, auth_token, sandbox_id)
    fp_id3 = bifrost.run().fp_id

    dupes = get(f"entities/{fp_id1}/dupes", None, sandbox_tenant.s_sk)
    assert len(dupes["same_tenant"]) == 2

    # Check dupe made via API
    dupe2 = next(d for d in dupes["same_tenant"] if d["fp_id"] == fp_id2)
    assert dupe2["dupe_kinds"] == ["email"]
    assert dupe2["status"] == "none"
    assert (
        next(d for d in dupe2["data"] if d["identifier"] == "id.first_name")["value"]
        == "Bob2"
    )

    # Check dupe made via Bifrost
    dupe3 = next(d for d in dupes["same_tenant"] if d["fp_id"] == fp_id3)
    assert dupe3["dupe_kinds"] == ["email"]
    assert dupe3["status"] == "pass"
    assert (
        next(d for d in dupe3["data"] if d["identifier"] == "id.first_name")["value"]
        == bifrost.data["id.first_name"]
    )

    assert not any(
        d["identifier"] == "id.email" for d in dupes["same_tenant"][0]["data"]
    )
    assert dupes["other_tenant"] is None, "Shouldn't have other_tenant dupes in sandbox"

    # the singular live vault is shown as having no dupes
    live_dupes = get(f"entities/{live_fp_id}/dupes", None, sandbox_tenant.l_sk)
    assert live_dupes["same_tenant"] == []
    assert live_dupes["other_tenant"] == {"num_matches": 0, "num_tenants": 0}


def test_composite_dupes(sandbox_tenant, faker):
    nonce = _gen_random_str(8)
    ssn = _gen_random_ssn()
    data = {
        "id.first_name": f"Hayes {nonce}",
        "id.last_name": "Valley",
        "id.dob": faker.date(),
        "id.ssn4": ssn[-4:],
        "card.hayes.number": faker.credit_card_number("visa"),
        "card.hayes.expiration": faker.credit_card_expire(),
        "card.hayes.cvc": faker.credit_card_security_code("visa"),
        "bank.hayes.ach_routing_number": faker.aba(),
        "bank.hayes.ach_account_number": faker.bban(),
    }

    fp_id1 = post("users", data, sandbox_tenant.s_sk, IgnoreCardValidation("true"))[
        "id"
    ]

    data["id.last_name"] = data["id.last_name"].lower()
    fp_id2 = post("users", data, sandbox_tenant.s_sk, IgnoreCardValidation("true"))[
        "id"
    ]

    ssn2 = _gen_random_ssn()
    other_data = {
        **data,
        "id.first_name": f"Noe {nonce}",
        "id.ssn4": ssn2[-4:],
        "card.hayes.number": faker.credit_card_number("visa"),
        "bank.hayes.ach_account_number": faker.bban(),
    }
    fp_id3 = post(
        "users", other_data, sandbox_tenant.s_sk, IgnoreCardValidation("true")
    )["id"]

    dupes = get(f"entities/{fp_id1}/dupes", None, sandbox_tenant.s_sk)
    assert len(dupes["same_tenant"]) == 1
    assert dupes["same_tenant"][0]["fp_id"] == fp_id2
    assert set(dupes["same_tenant"][0]["dupe_kinds"]) == {
        "name_dob",
        "name_ssn4",
        "dob_ssn4",
        "card_number_cvc",
        "bank_routing_account",
    }

    # When we update fp_id3's first name, it will make a new composite fingerprint that matches.
    data = {"id.first_name": data["id.first_name"]}
    patch(
        f"users/{fp_id3}/vault", data, sandbox_tenant.s_sk, IgnoreCardValidation("true")
    )

    dupes = get(f"entities/{fp_id1}/dupes", None, sandbox_tenant.s_sk)
    assert len(dupes["same_tenant"]) == 2
    dupe2 = next(d for d in dupes["same_tenant"] if d["fp_id"] == fp_id2)
    assert set(dupe2["dupe_kinds"]) == {
        "name_dob",
        "name_ssn4",
        "dob_ssn4",
        "card_number_cvc",
        "bank_routing_account",
    }

    dupe3 = next(d for d in dupes["same_tenant"] if d["fp_id"] == fp_id3)
    assert set(dupe3["dupe_kinds"]) == {
        "name_dob",
    }

    # Updating the last name, credit card number, ssn4, and ach account will deactivate the matching composite fingerprint and make a
    # new composite fingerprint that doesn't match
    ssn3 = _gen_random_ssn()
    data = {
        "id.last_name": "Hill",
        "id.ssn4": ssn3[-4:],
        "card.hayes.number": faker.credit_card_number("visa"),
        "bank.hayes.ach_account_number": faker.bban(),
    }
    patch(
        f"users/{fp_id3}/vault", data, sandbox_tenant.s_sk, IgnoreCardValidation("true")
    )
    dupes = get(f"entities/{fp_id1}/dupes", None, sandbox_tenant.s_sk)
    assert not any(i["fp_id"] == fp_id3 for i in dupes["same_tenant"])


def test_additional_dupes(sandbox_tenant, faker):
    nonce = _gen_random_str(8)
    dl_number = _gen_random_str(8)
    ssn = _gen_random_ssn()
    dob = faker.date()
    data = {
        "id.first_name": f"Hayes {nonce}",
        "id.last_name": "Valley",
        "id.dob": dob,
        "id.ssn4": ssn[-4:],
        "document.drivers_license.document_number": f"{dl_number}",
    }

    fp_id1 = post("users", data, sandbox_tenant.s_sk, IgnoreCardValidation("true"))[
        "id"
    ]
    # Create another user with the same info, should have a lot of dupe kinds
    fp_id2 = post("users", data, sandbox_tenant.s_sk, IgnoreCardValidation("true"))[
        "id"
    ]

    # Create another user with different information, but same dob + ssn4
    data2 = {
        "id.first_name": f"Horsey {nonce}",
        "id.last_name": "Valley",
        "id.dob": dob,
        "id.ssn4": ssn[-4:],
        "document.drivers_license.document_number": f"{dl_number}_other",
    }
    fp_id3 = post("users", data2, sandbox_tenant.s_sk, IgnoreCardValidation("true"))[
        "id"
    ]

    dupes = get(f"entities/{fp_id1}/dupes", None, sandbox_tenant.s_sk)
    assert len(dupes["same_tenant"]) == 2
    dupe_fp_id2 = next(d for d in dupes["same_tenant"] if d["fp_id"] == fp_id2)
    assert set(dupe_fp_id2["dupe_kinds"]) == set(
        ["identity_document_number", "name_dob", "dob_ssn4", "name_ssn4"]
    )
    dupe_fp_id3 = next(d for d in dupes["same_tenant"] if d["fp_id"] == fp_id3)
    assert set(dupe_fp_id3["dupe_kinds"]) == set(["dob_ssn4"])
