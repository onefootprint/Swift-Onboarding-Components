import pytest
from tests.auth import FpAuth
from tests.conftest import generate_real_phone_number
from tests.utils import _gen_random_n_digit_number, post
from tests.utils import (
    get,
    try_until_success,
)
from tests.bifrost_client import BifrostClient

def test_reonboard(sandbox_tenant, twilio, sandbox_user):
    # User one-clicks onto same ob config
    bifrost = BifrostClient(
        sandbox_tenant.default_ob_config,
        twilio,
        override_inherit_phone=sandbox_user.client.data["id.phone_number"],
    )
    bifrost.run()
    # TODO: later assert that data cannot be edited (since we aren't in a redo workflow)
    bifrost.handle_authorize() # have to manually hit /authorize for now, since this isn't currently going to be recognized as an outstanding requirement
    assert len(bifrost.handled_requirements) == 0

    # no new KYC checks should be run, we should still only 1 OBD
    timeline = get(
        f"entities/{sandbox_user.fp_id}/timeline",
        None,
        sandbox_user.tenant.sk.key,
    )
    obds = [i for i in timeline if i["event"]["kind"] == "onboarding_decision"]
    assert len(obds) == 1

