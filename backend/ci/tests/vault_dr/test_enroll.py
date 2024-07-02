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


    # Enrollment fails with bad bucket name.
    with footprint_dr("enroll", "--sandbox") as cmd:
        i = cmd.expect_exact([
            r"Re-enrolling will deactivate the current configuration",
            f"Enrolling {tenant.name} (Sandbox) in Vault Disaster Recovery",
        ])
        if i == 0:
            cmd.expect("Type .+ to continue, or anything else to cancel: ")
            cmd.sendline("restart sandbox-mode Vault Disaster Recovery from scratch")

        cmd.expect("Enter AWS Account ID: ")
        cmd.sendline(aws_account_id)

        cmd.expect("Enter AWS Role Name: ")
        cmd.sendline(iam_role_name)

        cmd.expect("Enter S3 Bucket Name: ")
        cmd.sendline(bucket_name + "bad")

        cmd.expect("Verifying configuration... Failed")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 1

    # localstack's lack of IAM enforcement prevents us from testing an invalid role name.

    # Enrollment fails with bad account ID.
    with footprint_dr("enroll", "--sandbox") as cmd:
        i = cmd.expect_exact([
            r"Re-enrolling will deactivate the current configuration",
            f"Enrolling {tenant.name} (Sandbox) in Vault Disaster Recovery",
        ])
        if i == 0:
            cmd.expect("Type .+ to continue, or anything else to cancel: ")
            cmd.sendline("restart sandbox-mode Vault Disaster Recovery from scratch")

        cmd.expect("Enter AWS Account ID: ")
        cmd.sendline(aws_account_id + "bad")

        cmd.expect("Enter AWS Role Name: ")
        cmd.sendline(iam_role_name)

        cmd.expect("Enter S3 Bucket Name: ")
        cmd.sendline(bucket_name)

        cmd.expect("Verifying configuration... Failed")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 1


    # Enrollment works with valid data.
    with footprint_dr("enroll", "--sandbox") as cmd:
        i = cmd.expect_exact([
            r"Re-enrolling will deactivate the current configuration",
            f"Enrolling {tenant.name} (Sandbox) in Vault Disaster Recovery",
        ])
        if i == 0:
            cmd.expect("Type .+ to continue, or anything else to cancel: ")
            cmd.sendline("restart sandbox-mode Vault Disaster Recovery from scratch")

        cmd.expect("Enter AWS Account ID: ")
        cmd.sendline(aws_account_id)

        cmd.expect("Enter AWS Role Name: ")
        cmd.sendline(iam_role_name)

        cmd.expect("Enter S3 Bucket Name: ")
        cmd.sendline(bucket_name)

        cmd.expect("Verifying configuration... OK")

        cmd.expect("AGE-SECRET-KEY-")

        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0


    # Status now reflects enrollment.
    with footprint_dr("status", "--sandbox") as cmd:
        cmd.expect(f"Logged in to {tenant.name} \\(Sandbox\\)")
        cmd.expect(r"Enrolled in Vault Disaster Recovery since: ([0-9:\.\- ]+ UTC)")
        enrolled_at = cmd.match.group(1)

        cmd.expect("Organization Public Keys:")
        cmd.expect("age1")

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

        cmd.expect("Enter AWS Account ID: ")
        cmd.sendline(aws_account_id)

        cmd.expect("Enter AWS Role Name: ")
        cmd.sendline(iam_role_name + "bad")

        cmd.expect("Enter S3 Bucket Name: ")
        cmd.sendline(bucket_name + "bad")

        cmd.expect("Verifying configuration... Failed")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 1
