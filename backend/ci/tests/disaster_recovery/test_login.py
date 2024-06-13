import pexpect
from tests.disaster_recovery.utils import footprint_dr


# Keep in mind that tests are run in parallel, so we must have the same login
# configuration for all footprint-dr tests.
def test_footprint_dr_login(sandbox_tenant, tenant):
    # Login requires --sandbox or --live.
    with footprint_dr("login") as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2


    # Can log in to sandbox tenant.
    with footprint_dr("login", "--sandbox") as cmd:
        cmd.expect("Enter Footprint Sandbox API key:")
        cmd.sendline(sandbox_tenant.sk[0].value)
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    with footprint_dr("status", "--sandbox") as cmd:
        cmd.expect(f"Logged in to {sandbox_tenant.name} \\(Sandbox\\)")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0


    # Can log in to live tenant.
    with footprint_dr("login", "--live") as cmd:
        cmd.expect("Enter Footprint Live API key:")
        cmd.sendline(tenant.sk[0].value)

        # Pass through the warning about mismatching tenants.
        cmd.expect(f"Continue logging in to {tenant.name} \\(Live\\).+")
        cmd.sendline("y")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    with footprint_dr("status", "--live") as cmd:
        cmd.expect(pexpect.EOF)
    assert f"Logged in to {tenant.name} (Live)" in cmd.before.decode()
    assert cmd.exitstatus == 0


    # Can't log in to live tenant with sandbox key.
    with footprint_dr("login", "--live") as cmd:
        cmd.expect("Enter Footprint Live API key:")
        cmd.sendline(sandbox_tenant.sk[0].value)
        cmd.expect("Error: The given API key is for the Sandbox environment, not the Live environment.")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 1


    # Can't log in to sandbox tenant with live key.
    with footprint_dr("login", "--sandbox") as cmd:
        cmd.expect("Enter Footprint Sandbox API key:")
        cmd.sendline(tenant.sk[0].value)
        cmd.expect("Error: The given API key is for the Live environment, not the Sandbox environment.")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 1
