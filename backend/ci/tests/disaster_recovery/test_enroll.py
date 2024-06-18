import pytest
import pexpect
from tests.constants import ENVIRONMENT
from tests.disaster_recovery.utils import *


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


    with footprint_dr("enroll", "--sandbox") as cmd:
        cmd.expect("Enter AWS Account ID: ")
        cmd.sendline(aws_account_id)

        cmd.expect("Enter AWS Role Name: ")
        cmd.sendline(iam_role_name)

        cmd.expect("Enter S3 Bucket Name: ")
        cmd.sendline(bucket_name)

        # TODO:
        # cmd.expect("Verifying bucket access... OK")

        cmd.expect(pexpect.EOF)
    # TODO: We need to implement re-enrollment to make these assertion valid in
    # dev/prod integration tests.

    # assert cmd.exitstatus == 0

    with footprint_dr("status", "--sandbox") as cmd:
        cmd.expect(f"Logged in to {tenant.name} \\(Sandbox\\)")
        cmd.expect("Enrolled in Vault Disaster Recovery since:")

        # TODO: needs re-enrollment
        # cmd.expect(f"AWS Account ID: {aws_account_id}")
        # cmd.expect(f"AWS Role Name: {iam_role_name}")
        # cmd.expect(f"S3 Bucket Name: {bucket_name}")
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0


