import pexpect
import sys
import os


# Runs footprint-dr such that the gnome keyring is available.
def footprint_dr(*args):
    return pexpect.spawn(
        "dbus-run-session",
        ["--", "bash", "-c", "echo -n test | gnome-keyring-daemon --unlock && footprint-dr $@", "--"] + list(args),
        timeout=5,
        logfile=sys.stdout.buffer,
        env=os.environ | {
            "LOG_LEVEL": "debug",
            "FOOTPRINT_API_ROOT": os.environ["TEST_URL"],
        },
    )


def login_sandbox(tenant):
    with footprint_dr("login", "--sandbox") as cmd:
        cmd.expect("Enter Footprint Sandbox API key:")
        cmd.sendline(tenant.s_sk.value)
        cmd.expect(pexpect.EOF)

    assert cmd.exitstatus == 0


def login_live(tenant):
    with footprint_dr("login", "--live") as cmd:
        cmd.expect("Enter Footprint Live API key:")
        cmd.sendline(tenant.l_sk.value)
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0
