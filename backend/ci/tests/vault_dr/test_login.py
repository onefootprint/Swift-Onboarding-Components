import pexpect
from tests.vault_dr.utils import footprint_dr, login_sandbox, login_live


# Keep in mind that tests are run in parallel, so we must have the same login
# configuration for all footprint-dr tests.
def test_footprint_dr_login(sandbox_tenant, tenant):
    # login requires --sandbox or --live.
    with footprint_dr("login") as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2

    # Can log in to tenant in sandbox mode.
    login_sandbox(tenant)

    with footprint_dr("status", "--sandbox") as cmd:
        cmd.expect(f"Logged in to {tenant.name} \\(Sandbox\\)")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Can log in to tenant in live mode.
    login_live(tenant)

    with footprint_dr("status", "--live") as cmd:
        cmd.expect(pexpect.EOF)
    assert f"Logged in to {tenant.name} (Live)" in cmd.before.decode()
    assert cmd.exitstatus == 0

    # Can't log in to live mode with sandbox key.
    with footprint_dr("login", "--live") as cmd:
        cmd.expect("Enter Footprint Live API key:")
        cmd.sendline(tenant.s_sk.value)
        cmd.expect(
            "Error: The given API key is for the Sandbox environment, not the Live environment."
        )
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 1

    # Can't log in to sandbox mode with live key.
    with footprint_dr("login", "--sandbox") as cmd:
        cmd.expect("Enter Footprint Sandbox API key:")
        cmd.sendline(tenant.l_sk.value)
        cmd.expect(
            "Error: The given API key is for the Live environment, not the Sandbox environment."
        )
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 1

    # Warning is displayed if tenants are different for sandbox and live mode.
    with footprint_dr("login", "--sandbox") as cmd:
        cmd.expect("Enter Footprint Sandbox API key:")
        cmd.sendline(sandbox_tenant.s_sk.value)
        cmd.expect(f"Continue logging in to {sandbox_tenant.name} \\(Sandbox\\).+")
        cmd.sendline("n")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 1


def test_footprint_dr_env_var_login(sandbox_tenant, tenant):
    with footprint_dr("status", "--sandbox", api_key=sandbox_tenant.s_sk.value) as cmd:
        cmd.expect(f"Logged in to {sandbox_tenant.name} \\(Sandbox\\)")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    with footprint_dr("status", "--live", api_key=tenant.l_sk.value) as cmd:
        cmd.expect(f"Logged in to {tenant.name} \\(Live\\)")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    with footprint_dr("status", "--live", api_key=sandbox_tenant.s_sk.value) as cmd:
        cmd.expect(
            "Error: The given FOOTPRINT_API_KEY environment variable is for the Sandbox environment, not the Live environment"
        )
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 1
