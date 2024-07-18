import botocore
import boto3
import json
import os
import pexpect
import re
import sys
from dataclasses import dataclass

from tests.utils import _gen_random_n_digit_number
from tests.constants import VDR_AGE_KEYS


EXTERNAL_ID_PATTERN = r"\b([a-z0-9]{32})\b"

def footprint_dr(*args):
    return pexpect.spawn(
        "footprint-dr",
        list(args),
        timeout=10,
        logfile=sys.stdout.buffer,
        env=os.environ | {
            "LOG_LEVEL": "debug",
            "FOOTPRINT_API_ROOT": os.environ["TEST_URL"],
            "AWS_PROFILE": "localstack",
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


@dataclass
class EnrollmentConfig:
    org_public_keys: list[str]
    aws_account_id: str
    aws_role_name: str
    s3_bucket_name: str

    # Extracts the config from the output of `footprint-dr status`.
    def parse_from_footprint_dr_status(output):
        match = re.search(r"Organization Public Keys:((?:\s*age1\S+\s*)+)", output)
        if match is None:
            # Not enrolled
            return None

        pubkeys = match.groups(1)[0].split()
        for key in pubkeys:
            assert key.startswith("age1")

        return EnrollmentConfig(
            org_public_keys=pubkeys,
            aws_account_id=re.search(r"AWS Account ID:\s*(\d+)", output).group(1),
            aws_role_name=re.search(r"AWS Role Name:\s*(\S+)", output).group(1),
            s3_bucket_name=re.search(r"S3 Bucket Name:\s*(\S+)", output).group(1),
        )



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

    cfg = EnrollmentConfig(
        org_public_keys=[
            VDR_AGE_KEYS["1"]["public"],
            VDR_AGE_KEYS["2"]["public"],
            # Include a Yubikey public key to test server-side encryption to
            # YubiKeys. We won't be able to actually decrypt using this
            # identity though since we don't have YubiKeys in CI. We'll use
            # the X25519 keys above for that.
            "age1yubikey1q23xqm9y4ym90e90jqzdtejvpm3k65460aqxca5nm2p3vxhtr9dky648v2p",
        ],
        aws_account_id=aws_account_id,
        aws_role_name=iam_role_name,
        s3_bucket_name=bucket_name,
    )

    # Compare the current configuration with the desired configuration.
    with footprint_dr("status", "--live") as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0
    output = cmd.before.decode()
    got_cfg = EnrollmentConfig.parse_from_footprint_dr_status(output)

    # If the configuration is already correct, leave it as is.
    if got_cfg == cfg:
        return

    # Otherwise, re-enroll the tenant in Vault Disaster Recovery.
    with footprint_dr("enroll", "--live") as cmd:
        i = cmd.expect_exact([
            r"Re-enrolling will deactivate the current configuration",
            f"Enrolling {tenant.name} (Live) in Vault Disaster Recovery",
        ])
        if i == 0:
            cmd.expect("Type .+ to continue, or anything else to cancel: ")
            cmd.sendline("restart live-mode Vault Disaster Recovery from scratch")

        cmd.expect_exact("Enter org public key (age recipient): ")
        cmd.sendline(cfg.org_public_keys[0])

        cmd.expect_exact("Are you sure you don't want the benefits of a hardware security token?")
        cmd.sendline("y")

        cmd.expect_exact("Add another org public key? [y/n] ")
        cmd.sendline("y")

        cmd.expect_exact("Enter org public key (age recipient): ")
        cmd.sendline(cfg.org_public_keys[1])

        cmd.expect_exact("Are you sure you don't want the benefits of a hardware security token?")
        cmd.sendline("y")

        cmd.expect_exact("Add another org public key? [y/n] ")
        cmd.sendline("y")

        cmd.expect_exact("Enter org public key (age recipient): ")
        cmd.sendline(cfg.org_public_keys[2])

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

    # Check that the configuration is now correct.
    with footprint_dr("status", "--live") as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0
    output = cmd.before.decode()
    got_cfg = EnrollmentConfig.parse_from_footprint_dr_status(output)
    assert got_cfg == cfg
