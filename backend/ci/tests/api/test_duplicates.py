import pytest
from tests.headers import SandboxId, IgnoreCardValidation
from tests.utils import post, patch, get
from tests.utils import (
    _gen_random_str,
    _gen_random_ssn,
    post,
    get,
    _gen_random_sandbox_id,
    patch,
)
from tests.constants import FIXTURE_PHONE_NUMBER
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
    )
    obc = sandbox_tenant.default_ob_config
    sandbox_id = _gen_random_sandbox_id()
    post("hosted/identify/signup_challenge", data, obc.key, SandboxId(sandbox_id))

    # Create another user that finished onboarding entirely
    sandbox_id = _gen_random_sandbox_id()
    auth_token = IdentifyClient(obc, sandbox_id, email=email).create_user()
    bifrost = BifrostClient(obc, auth_token, sandbox_id)
    fp_id3 = bifrost.run().fp_id

    dupes = get(f"users/{fp_id1}/duplicates", None, sandbox_tenant.s_sk)
    assert len(dupes["data"]) == 2

    # Check dupe made via API
    dupe2 = next(d for d in dupes["data"] if d["fp_id"] == fp_id2)
    assert dupe2["kind"] == "email"

    # Check dupe made via Bifrost
    dupe3 = next(d for d in dupes["data"] if d["fp_id"] == fp_id3)
    assert dupe3["kind"] == "email"

    # the singular live vault is shown as having no dupes
    live_dupes = get(f"users/{live_fp_id}/duplicates", None, sandbox_tenant.l_sk)
    assert live_dupes["data"] == []


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

    dupes = get(f"users/{fp_id1}/duplicates", None, sandbox_tenant.s_sk)
    assert len(dupes["data"]) == 5
    assert dupes["data"][0]["fp_id"] == fp_id2
    assert set(map(lambda dupe: dupe["kind"], dupes["data"])) == {
        "name_dob",
        "name_ssn4",
        "dob_ssn4",
        "card_number_cvc",
        "bank_routing_account",
    }

    # When we update fp_id3's first name, it will make a new composite fingerprint that matches.
    patch_data = {"id.first_name": data["id.first_name"]}
    patch(
        f"users/{fp_id3}/vault",
        patch_data,
        sandbox_tenant.s_sk,
        IgnoreCardValidation("true"),
    )

    dupes = get(f"users/{fp_id1}/duplicates", None, sandbox_tenant.s_sk)
    assert len(dupes["data"]) == 6
    dupes2 = list(filter(lambda dupe: dupe["fp_id"] == fp_id2, dupes["data"]))
    assert set(map(lambda dupe: dupe["kind"], dupes2)) == {
        "name_dob",
        "name_ssn4",
        "dob_ssn4",
        "card_number_cvc",
        "bank_routing_account",
    }

    dupes3 = list(filter(lambda dupe: dupe["fp_id"] == fp_id3, dupes["data"]))
    assert set(map(lambda dupe: dupe["kind"], dupes3)) == {
        "name_dob",
    }

    # Updating the last name, credit card number, and ach account will deactivate the matching composite fingerprint and make a
    # new composite fingerprint that doesn't match
    patch_data = {
        "id.last_name": "Hill",
        "card.hayes.number": faker.credit_card_number("visa"),
        "bank.hayes.ach_account_number": faker.bban(),
    }
    patch(
        f"users/{fp_id3}/vault",
        patch_data,
        sandbox_tenant.s_sk,
        IgnoreCardValidation("true"),
    )
    dupes = get(f"users/{fp_id1}/duplicates", None, sandbox_tenant.s_sk)
    assert not any(i["fp_id"] == fp_id3 for i in dupes["data"])

    # Add an additional card and bank account, ensure that dupes with the original card are not affected
    ssn3 = _gen_random_ssn()
    multi_cards_banks = {
        **data,
        "id.first_name": f"Mountain {nonce}",
        "id.ssn4": ssn3[-4:],
        "card.mountain.number": faker.credit_card_number("visa"),
        "card.mountain.expiration": faker.credit_card_expire(),
        "card.mountain.cvc": faker.credit_card_security_code("visa"),
        "bank.mountain.ach_routing_number": faker.aba(),
        "bank.mountain.ach_account_number": faker.bban(),
    }
    fp_id4 = post(
        "users", multi_cards_banks, sandbox_tenant.s_sk, IgnoreCardValidation("true")
    )["id"]
    dupes = get(f"users/{fp_id1}/duplicates", None, sandbox_tenant.s_sk)
    dupes4 = list(filter(lambda dupe: dupe["fp_id"] == fp_id4, dupes["data"]))
    assert set(map(lambda dupe: dupe["kind"], dupes4)) == {
        "card_number_cvc",
        "bank_routing_account",
    }


def test_composite_fingerprint_dis(sandbox_tenant, faker):
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

    # Add an additional card and bank account, ensure that dupes with the original card are not affected
    ssn3 = _gen_random_ssn()
    multi_cards_banks = {
        **data,
        "id.first_name": f"Mountain {nonce}",
        "id.ssn4": ssn3[-4:],
        "card.mountain.number": faker.credit_card_number("visa"),
        "card.mountain.expiration": faker.credit_card_expire(),
        "card.mountain.cvc": faker.credit_card_security_code("visa"),
        "bank.mountain.ach_routing_number": faker.aba(),
        "bank.mountain.ach_account_number": faker.bban(),
    }
    fp_id4 = post(
        "users", multi_cards_banks, sandbox_tenant.s_sk, IgnoreCardValidation("true")
    )["id"]

    # decrypt the data
    fields_to_decrypt = [
        "bank.hayes.fingerprint",
        "card.hayes.fingerprint",
        "bank.mountain.fingerprint",
        "card.mountain.fingerprint",
    ]
    data = dict(
        reason="test",
        fields=fields_to_decrypt,
    )

    body1 = post(f"entities/{fp_id1}/vault/decrypt", data, sandbox_tenant.s_sk)
    body2 = post(f"entities/{fp_id2}/vault/decrypt", data, sandbox_tenant.s_sk)
    body3 = post(f"entities/{fp_id3}/vault/decrypt", data, sandbox_tenant.s_sk)
    body4 = post(f"entities/{fp_id4}/vault/decrypt", data, sandbox_tenant.s_sk)

    assert {
        body1["bank.hayes.fingerprint"],
        body2["bank.hayes.fingerprint"],
        body3["bank.hayes.fingerprint"],
        body4["bank.hayes.fingerprint"],
    } == {
        body1["bank.hayes.fingerprint"],
        body3["bank.hayes.fingerprint"],
    }

    assert {
        body1["card.hayes.fingerprint"],
        body2["card.hayes.fingerprint"],
        body3["card.hayes.fingerprint"],
        body4["card.hayes.fingerprint"],
    } == {
        body1["card.hayes.fingerprint"],
        body3["card.hayes.fingerprint"],
    }

    assert body4["card.mountain.fingerprint"] != body4["card.hayes.fingerprint"]
    assert body4["bank.mountain.fingerprint"] != body4["bank.hayes.fingerprint"]

    # Attempt to set card and bank fingerprint DI's
    patch_data = {
        "card.hayes.fingerprint": "foo",
        "bank.hayes.fingerprint": "bar",
    }
    body = patch(
        f"users/{fp_id3}/vault",
        patch_data,
        sandbox_tenant.s_sk,
        IgnoreCardValidation("true"),
        status_code=400,
    )
    assert body["code"] == "T120"
    assert (
        body["context"]["bank.hayes.fingerprint"]
        == "Cannot specify this piece of data. It will automatically be derived."
    )
    assert (
        body["context"]["card.hayes.fingerprint"]
        == "Cannot specify this piece of data. It will automatically be derived."
    )
