from tests.utils import _gen_random_str, post, get, _gen_random_sandbox_id, patch
from tests.constants import FIXTURE_PHONE_NUMBER
from tests.headers import SandboxId
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
    data = dict(email=dict(value=email), phone_number=dict(value=FIXTURE_PHONE_NUMBER))
    obc = sandbox_tenant.default_ob_config
    sandbox_id = _gen_random_sandbox_id()
    post("hosted/identify/signup_challenge", data, obc.key, SandboxId(sandbox_id))

    # Create another user that finished onboarding entirely
    sandbox_id = _gen_random_sandbox_id()
    auth_token = IdentifyClient(obc.key, sandbox_id, email=email).create_user()
    bifrost = BifrostClient(obc, auth_token, sandbox_id)
    fp_id3 = bifrost.run().fp_id

    dupes = get(f"entities/{fp_id1}/dupes", None, sandbox_tenant.s_sk)
    assert len(dupes["same_tenant"]) == 2

    # Check dupe made via API
    dupe2 = next(d for d in dupes["same_tenant"] if d["fp_id"] == fp_id2)
    assert dupe2["dupe_kinds"] == ["email"]
    assert dupe2["status"] is None
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


def test_composite_dupes(sandbox_tenant):
    nonce = _gen_random_str(5)

    data = {
        "id.first_name": f"Hayes {nonce}",
        "id.last_name": "Valley",
        "id.dob": "1995-01-01",
    }
    fp_id1 = post("users", data, sandbox_tenant.s_sk)["id"]
    data["id.last_name"] = data["id.last_name"].lower()
    fp_id2 = post("users", data, sandbox_tenant.s_sk)["id"]

    other_data = {
        **data,
        "id.first_name": "Noe",
    }
    fp_id3 = post("users", other_data, sandbox_tenant.s_sk)["id"]

    dupes = get(f"entities/{fp_id1}/dupes", None, sandbox_tenant.s_sk)
    assert len(dupes["same_tenant"]) == 1
    assert dupes["same_tenant"][0]["fp_id"] == fp_id2
    assert dupes["same_tenant"][0]["dupe_kinds"] == ["name_dob"]

    # When we update fp_id3's first name, it will make a new composite fingerprint that matches.
    data = {"id.first_name": data["id.first_name"]}
    patch(f"users/{fp_id3}/vault", data, sandbox_tenant.s_sk)

    dupes = get(f"entities/{fp_id1}/dupes", None, sandbox_tenant.s_sk)
    assert len(dupes["same_tenant"]) == 2
    dupe2 = next(d for d in dupes["same_tenant"] if d["fp_id"] == fp_id2)
    assert dupe2["dupe_kinds"] == ["name_dob"]

    dupe3 = next(d for d in dupes["same_tenant"] if d["fp_id"] == fp_id3)
    assert dupe3["dupe_kinds"] == ["name_dob"]

    # And updating the last name will deactivate the matching composite fingerprint and make a
    # new composite fingerprint that doesn't match
    data = {"id.last_name": "Hill"}
    patch(f"users/{fp_id3}/vault", data, sandbox_tenant.s_sk)
    dupes = get(f"entities/{fp_id1}/dupes", None, sandbox_tenant.s_sk)
    assert not any(i["fp_id"] == fp_id3 for i in dupes["same_tenant"])
