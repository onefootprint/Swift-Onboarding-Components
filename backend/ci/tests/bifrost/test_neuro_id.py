from tests.bifrost_client import BifrostClient
from tests.utils import get_requirement_from_requirements, create_ob_config, patch, get


def test_get_neuro_id_id(sandbox_tenant, must_collect_data):
    obc = create_ob_config(
        sandbox_tenant,
        "Restricted doc request config",
        must_collect_data,
    )

    # 2 users going through bifrost
    bifrost = BifrostClient.new_user(obc)
    bifrost2 = BifrostClient.new_user(obc)

    id = get("hosted/onboarding/nid", None, bifrost.auth_token)["id"]
    id2 = get("hosted/onboarding/nid", None, bifrost.auth_token)["id"]
    id3 = get("hosted/onboarding/nid", None, bifrost2.auth_token)["id"]
    assert len(id) > 0
    assert len(id3) > 0
    # calling the endpoint for same user gives same id
    assert id == id2
    # calling for diff user gives diff id
    assert id != id3
