import pexpect
from tests.vault_dr.utils import footprint_dr


def test_footprint_dr_status():
    # status requires --sandbox or --live.
    with footprint_dr("status") as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2
