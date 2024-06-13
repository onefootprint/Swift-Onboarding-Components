import pexpect
from tests.disaster_recovery.utils import footprint_dr


def test_footprint_dr_status():
    # Status requires --sandbox or --live.
    with footprint_dr("status") as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2
