import pexpect
from tests.vault_dr.utils import footprint_dr, login_sandbox, login_live, get_external_id


def test_footprint_dr_get_external_id(tenant):
    # get-external-id requires --sandbox or --live.
    with footprint_dr("get-external-id") as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2

    # Fetching multiple times should return the same external ID for the sandbox tenant.
    login_sandbox(tenant)

    sandbox_external_id = get_external_id("sandbox")
    sandbox_external_id_2 = get_external_id("sandbox")
    assert sandbox_external_id == sandbox_external_id_2

    # Fetching multiple times should return the same external ID for the live tenant.
    login_live(tenant)
    live_external_id = get_external_id("live")
    live_external_id_2 = get_external_id("live")
    assert live_external_id == live_external_id_2

    # The sandbox and live external IDs should be different.
    assert sandbox_external_id != live_external_id

