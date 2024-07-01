import botocore
import boto3
import json
import os
import pexpect
import sys

from tests.utils import _gen_random_n_digit_number


EXTERNAL_ID_PATTERN = r"\b([a-z0-9]{32})\b"

def footprint_dr(*args):
    return pexpect.spawn(
        "footprint-dr",
        list(args),
        timeout=20,
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


def get_external_id(mode):
    with footprint_dr("get-external-id", "--" + mode) as cmd:
        cmd.expect(EXTERNAL_ID_PATTERN)
        external_id = cmd.match.group(1)
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0

    return external_id.decode("utf-8")


def localstack_session():
    return boto3.session.Session(profile_name="localstack")


def create_bucket(session, randomize=True):
    s3 = session.client("s3")

    suffix = ""
    if randomize:
        suffix = "-" + _gen_random_n_digit_number(16)

    bucket_name = "acme-inc-footprint-vault-data" + suffix
    s3.create_bucket(
        Bucket=bucket_name,
    )

    return bucket_name


# Note that Localstack doesn't really enforce IAM.
def create_iam_role(session, bucket_name, external_id, randomize=True):
    iam = session.client("iam")

    assume_role_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "AWS": "arn:aws:iam::725896863556:root"
                },
                "Action": "sts:AssumeRole",
                "Condition": {
                    "StringEquals": {
                        "sts:ExternalId": external_id
                    }
                }
            }
        ]
    }

    suffix = ""
    if randomize:
        suffix = "-" + _gen_random_n_digit_number(16)

    role_name = "fp-vault-data-management" + suffix
    try:
        role_response = iam.create_role(
            RoleName=role_name,
            AssumeRolePolicyDocument=json.dumps(assume_role_policy)
        )
    except iam.exceptions.EntityAlreadyExistsException as e:
        if randomize:
            raise e

    inline_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowFootprintWriteObjects",
                "Effect": "Allow",
                "Action": [
                    "s3:PutObject"
                ],
                "Resource": f"arn:aws:s3:::{bucket_name}/*"
            },
            {
                "Sid": "AllowFootprintListObjects",
                "Effect": "Allow",
                "Action": [
                    "s3:ListBucket"
                ],
                "Resource": f"arn:aws:s3:::{bucket_name}",
            },
            {
                "Sid": "AllowFootprintGetBucketLocation",
                "Effect": "Allow",
                "Action": [
                    "s3:GetBucketLocation"
                ],
                "Resource": f"arn:aws:s3:::{bucket_name}",
            }
        ]
    }

    iam.put_role_policy(
        RoleName=role_name,
        PolicyName="fp-vault-data-management",
        PolicyDocument=json.dumps(inline_policy)
    )

    return role_name


# Idempotently enroll a tenant Vault Disaster Recovery (live mode)
def enroll_tenant_in_live_vdr(tenant):
    login_live(tenant)

    external_id = get_external_id("live")

    session = localstack_session()

    # Since the access key in .aws/credentials is a 12 digit number, localstack
    # uses it as the account ID.
    aws_account_id = session.get_credentials().access_key

    # Create cloud resources idempotently.
    bucket_name = create_bucket(session, randomize=False)

    iam_role_name = create_iam_role(session, bucket_name, external_id, randomize=False)


    with footprint_dr("enroll", "--live") as cmd:
        i = cmd.expect_exact([
            r"Re-enrolling will deactivate the current configuration",
            f"Enrolling {tenant.name} (Live) in Vault Disaster Recovery",
        ])
        if i == 0:
            # Already enrolled. Don't re-enroll to keep this function idempotent.
            cmd.expect("Type .+ to continue, or anything else to cancel: ")
            return

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
