import pytest
from tests.bifrost_client import BifrostClient
from tests.utils import patch, post, _gen_random_str
from tests.headers import ExternalId


@pytest.mark.parametrize("url", ["users", "businesses"])
def test_bifrost_user_update_external_id(sandbox_tenant, url):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    user = bifrost.run()
    fp_id = user.fp_id

    # Apply an external ID to the user
    external_id = f"ext_id_{_gen_random_str(15)}"
    patch(f"{url}/{fp_id}", dict(external_id=external_id), sandbox_tenant.s_sk)

    # Idempotently create the user via API with the same external ID
    body = post(url, None, ExternalId(external_id), sandbox_tenant.s_sk)
    assert body["id"] == fp_id
    assert body["external_id"] == external_id
