import pytest
import pexpect
from tests.constants import ENVIRONMENT
from tests.vault_dr.utils import *


# To allow for tests to run concurrently, we'll test enrollment and
# re-enrollment flows in sandbox mode. For all other tests that can enroll
# idempotently, we'll use live mode.
@pytest.mark.skipif(
    ENVIRONMENT in ("ephemeral", "dev", "production"),
    reason="This test relies on localstack",
)
def test_footprint_dr_enroll(tenant):
    # enroll requires --sandbox or --live.
    with footprint_dr("enroll") as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 2

    login_sandbox(tenant)
    external_id = get_external_id("sandbox")

    session = localstack_session()

    # Since the access key in .aws/credentials is a 12 digit number, localstack
    # uses it as the account ID.
    aws_account_id = session.get_credentials().access_key

    bucket_name = create_bucket(session)
    iam_role_name = create_iam_role(session, bucket_name, external_id)

    # Enrollment fails with bad age recipient.
    for bad_recipient in [
        # Bad plugin
        "age1tpm1qg86fn5esp30u9h6jy6zvu9gcsvnac09vn8jzjxt8s3qtlcv5h2x287wm36",
        # Bad key
        "age2123",
        "age1yubikey1q23xqm9y4ym90e90jqzdtjvpm3k65460aqxca5nm2p3vxhtr9dky648v2p3",
        "age1yubikey1q23xqm9y4ym90e90jqzdt460aqxca5nm2p3vxhtr9dky648v2p3vxhtr9dky648v2p3vxhtr9dky648v2p",
        "age1yubikey1q23xqm9y4ym90e90jqzdt5460aqxca5nm",
    ]:
        with footprint_dr("enroll", "--sandbox") as cmd:
            i = cmd.expect_exact(
                [
                    r"Re-enrolling will deactivate the current configuration",
                    f"Enrolling {tenant.name} (Sandbox) in Vault Disaster Recovery",
                ]
            )
            if i == 0:
                cmd.expect("Type .+ to continue, or anything else to cancel: ")
                cmd.sendline(
                    "restart sandbox-mode Vault Disaster Recovery from scratch"
                )

            cmd.expect_exact("Enter org public key (age recipient): ")
            cmd.sendline(bad_recipient)
            cmd.expect(pexpect.EOF)
        assert cmd.exitstatus == 1, bad_recipient

    # Enrollment fails with bad bucket name.
    with footprint_dr("enroll", "--sandbox") as cmd:
        i = cmd.expect_exact(
            [
                r"Re-enrolling will deactivate the current configuration",
                f"Enrolling {tenant.name} (Sandbox) in Vault Disaster Recovery",
            ]
        )
        if i == 0:
            cmd.expect("Type .+ to continue, or anything else to cancel: ")
            cmd.sendline("restart sandbox-mode Vault Disaster Recovery from scratch")

        cmd.expect_exact("Enter org public key (age recipient): ")
        cmd.sendline(
            "age1yubikey1q23xqm9y4ym90e90jqzdtejvpm3k65460aqxca5nm2p3vxhtr9dky648v2p"
        )

        cmd.expect_exact("Add another org public key? [y/n] ")
        cmd.sendline("n")

        cmd.expect("Enter AWS account ID: ")
        cmd.sendline(aws_account_id)

        cmd.expect("Enter AWS role name: ")
        cmd.sendline(iam_role_name)

        cmd.expect("Enter S3 bucket name: ")
        cmd.sendline(bucket_name + "bad")

        cmd.expect("Verifying configuration... Failed")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 1

    # localstack's lack of IAM enforcement prevents us from testing an invalid role name.

    # Enrollment fails with bad account ID.
    with footprint_dr("enroll", "--sandbox") as cmd:
        i = cmd.expect_exact(
            [
                r"Re-enrolling will deactivate the current configuration",
                f"Enrolling {tenant.name} (Sandbox) in Vault Disaster Recovery",
            ]
        )
        if i == 0:
            cmd.expect("Type .+ to continue, or anything else to cancel: ")
            cmd.sendline("restart sandbox-mode Vault Disaster Recovery from scratch")

        cmd.expect_exact("Enter org public key (age recipient): ")
        cmd.sendline(
            "age1yubikey1q23xqm9y4ym90e90jqzdtejvpm3k65460aqxca5nm2p3vxhtr9dky648v2p"
        )

        cmd.expect_exact("Add another org public key? [y/n] ")
        cmd.sendline("n")

        cmd.expect("Enter AWS account ID: ")
        cmd.sendline(aws_account_id + "bad")

        cmd.expect("Enter AWS role name: ")
        cmd.sendline(iam_role_name)

        cmd.expect("Enter S3 bucket name: ")
        cmd.sendline(bucket_name)

        cmd.expect("Verifying configuration... Failed")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 1

    # Enrollment works with valid data.
    with footprint_dr("enroll", "--sandbox") as cmd:
        i = cmd.expect_exact(
            [
                r"Re-enrolling will deactivate the current configuration",
                f"Enrolling {tenant.name} (Sandbox) in Vault Disaster Recovery",
            ]
        )
        if i == 0:
            cmd.expect("Type .+ to continue, or anything else to cancel: ")
            cmd.sendline("restart sandbox-mode Vault Disaster Recovery from scratch")

        cmd.expect_exact("Enter org public key (age recipient): ")
        cmd.sendline(
            "age1yubikey1q23xqm9y4ym90e90jqzdtejvpm3k65460aqxca5nm2p3vxhtr9dky648v2p"
        )

        cmd.expect_exact("Add another org public key? [y/n] ")
        cmd.sendline("y")

        cmd.expect_exact("Enter org public key (age recipient): ")
        cmd.sendline("age1flfhl58lnf7r98chptw92hlqr7w9qgr47lxvdgtkmjusw6lv75nsfkwwx3")

        cmd.expect_exact(
            "Are you sure you don't want the benefits of a hardware security token?"
        )
        cmd.sendline("y")

        cmd.expect_exact("Add another org public key? [y/n] ")
        cmd.sendline("n")

        cmd.expect("Enter AWS account ID: ")
        cmd.sendline(aws_account_id)

        cmd.expect("Enter AWS role name: ")
        cmd.sendline(iam_role_name)

        cmd.expect("Enter S3 bucket name: ")
        cmd.sendline(bucket_name)

        cmd.expect("Verifying configuration... OK")

        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Status now reflects enrollment.
    with footprint_dr("status", "--sandbox") as cmd:
        cmd.expect(f"Logged in to {tenant.name} \\(Sandbox\\)")
        cmd.expect(r"Enrolled in Vault Disaster Recovery since: ([0-9:\.\- ]+ UTC)")
        enrolled_at = cmd.match.group(1)

        cmd.expect("Organization Public Keys:")
        cmd.expect(
            "age1yubikey1q23xqm9y4ym90e90jqzdtejvpm3k65460aqxca5nm2p3vxhtr9dky648v2p"
        )
        cmd.expect("age1flfhl58lnf7r98chptw92hlqr7w9qgr47lxvdgtkmjusw6lv75nsfkwwx3")

        cmd.expect(f"AWS Account ID: {aws_account_id}")
        cmd.expect(f"AWS Role Name:  {iam_role_name}")
        cmd.expect(f"S3 Bucket Name: {bucket_name}")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    # Re-enrollment fails with bogus data.
    with footprint_dr("enroll", "--sandbox") as cmd:
        cmd.expect(r"Re-enrolling will deactivate the current configuration")
        cmd.expect("Type .+ to continue, or anything else to cancel: ")
        cmd.sendline("restart sandbox-mode Vault Disaster Recovery from scratch")

        cmd.expect_exact("Enter org public key (age recipient): ")
        cmd.sendline(
            "age1yubikey1q23xqm9y4ym90e90jqzdtejvpm3k65460aqxca5nm2p3vxhtr9dky648v2p"
        )

        cmd.expect_exact("Add another org public key? [y/n] ")
        cmd.sendline("n")

        cmd.expect("Enter AWS account ID: ")
        cmd.sendline(aws_account_id)

        cmd.expect("Enter AWS role name: ")
        cmd.sendline(iam_role_name + "bad")

        cmd.expect("Enter S3 bucket name: ")
        cmd.sendline(bucket_name + "bad")

        cmd.expect("Verifying configuration... Failed")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 1
