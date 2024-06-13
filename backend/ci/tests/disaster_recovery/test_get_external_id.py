import pexpect
from tests.disaster_recovery.utils import footprint_dr, login_sandbox, login_live

EXTERNAL_ID_PATTERN = r"\b([a-z0-9]{32})\b"

def test_footprint_dr_get_external_id(tenant):
    # get-external-id requires --sandbox or --live.
    with footprint_dr("get-external-id") as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2

    # Fetching multiple times should return the same external ID for the sandbox tenant.
    login_sandbox(tenant)
    with footprint_dr("get-external-id", "--sandbox") as cmd:
        cmd.expect(EXTERNAL_ID_PATTERN)
        sandbox_external_id = cmd.match.group(1)
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    with footprint_dr("get-external-id", "--sandbox") as cmd:
        cmd.expect(EXTERNAL_ID_PATTERN)
        sandbox_external_id_2 = cmd.match.group(1)
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    assert sandbox_external_id == sandbox_external_id_2

    # Fetching multiple times should return the same external ID for the live tenant.
    login_live(tenant)
    with footprint_dr("get-external-id", "--live") as cmd:
        cmd.expect(EXTERNAL_ID_PATTERN)
        live_external_id = cmd.match.group(1)
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    with footprint_dr("get-external-id", "--live") as cmd:
        cmd.expect(EXTERNAL_ID_PATTERN)
        live_external_id_2 = cmd.match.group(1)
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    assert live_external_id == live_external_id_2

    # The sandbox and live external IDs should be different.
    assert sandbox_external_id != live_external_id

