from tests.constants import FIXTURE_PHONE_NUMBER, EMAIL
from tests.utils import _gen_random_sandbox_id, post, get
from tests.headers import SandboxId


def test_entity_created_after_signup_challenge(sandbox_tenant):
    sandbox_id = _gen_random_sandbox_id()
    post(
        "hosted/identify/signup_challenge",
        dict(phone_number=FIXTURE_PHONE_NUMBER, email=EMAIL),
        sandbox_tenant.default_ob_config.key,
        SandboxId(sandbox_id),
    )

    # Make sure entity is created after initiating signup challenge. Should be hidden
    body = get("entities", None, *sandbox_tenant.db_auths)
    assert not any(e["sandbox_id"] == sandbox_id for e in body["data"])

    # But we can find it with show_all
    body = get("entities", dict(show_all="true"), *sandbox_tenant.db_auths)
    entity = next(e for e in body["data"] if e["sandbox_id"] == sandbox_id)
    assert set(entity["decryptable_attributes"]) == {"id.email", "id.phone_number"}
    assert entity["status"] == "in_progress"
