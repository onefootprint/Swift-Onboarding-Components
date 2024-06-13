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
