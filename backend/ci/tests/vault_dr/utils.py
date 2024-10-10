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


def footprint_dr(*args, api_root=None, api_key=None, skip_client_checks=False):
    api_root = api_root or os.environ["TEST_URL"]

    return pexpect.spawn(
        "footprint-dr",
        list(args),
        timeout=10,
        logfile=sys.stdout.buffer,
        env=os.environ
        | {
            "LOG_LEVEL": "debug",
            "FOOTPRINT_API_ROOT": api_root,
            "AWS_PROFILE": "localstack",
        }
        | (
            {
                "FOOTPRINT_API_KEY": api_key,
            }
            if api_key
            else {}
        )
        | (
            {
                # Skipping client checks speeds up tests by eliminating
                # repetitive calls to GET /org/vault_dr/status.
                "SKIP_FOOTPRINT_CLIENT_CHECKS": "1",
            }
            if skip_client_checks
            else {}
        ),
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
                "Principal": {"AWS": "arn:aws:iam::725896863556:root"},
                "Action": "sts:AssumeRole",
                "Condition": {"StringEquals": {"sts:ExternalId": external_id}},
            }
        ],
    }

    suffix = ""
    if randomize:
        suffix = "-" + _gen_random_n_digit_number(16)

    role_name = "fp-vault-data-management" + suffix
    try:
        role_response = iam.create_role(
            RoleName=role_name, AssumeRolePolicyDocument=json.dumps(assume_role_policy)
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
                "Action": ["s3:PutObject"],
                "Resource": f"arn:aws:s3:::{bucket_name}/*",
            },
            {
                "Sid": "AllowFootprintListObjects",
                "Effect": "Allow",
                "Action": ["s3:ListBucket"],
                "Resource": f"arn:aws:s3:::{bucket_name}",
            },
            {
                "Sid": "AllowFootprintGetBucketLocation",
                "Effect": "Allow",
                "Action": ["s3:GetBucketLocation"],
                "Resource": f"arn:aws:s3:::{bucket_name}",
            },
        ],
    }

    iam.put_role_policy(
        RoleName=role_name,
        PolicyName="fp-vault-data-management",
        PolicyDocument=json.dumps(inline_policy),
    )

    return role_name


@dataclass
class EnrollmentConfig:
    org_public_keys: list[str]
    aws_account_id: str
    aws_role_name: str
    s3_bucket_name: str
    namespace: str

    def client_params_match(self, other):
        if other is None:
            return False

        return (
            self.org_public_keys == other.org_public_keys
            and self.aws_account_id == other.aws_account_id
            and self.aws_role_name == other.aws_role_name
            and self.s3_bucket_name == other.s3_bucket_name
            # Namespace is provided by the server, so it's excluded.
        )

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
            namespace=re.search(r"Namespace:\s*(\S+)", output).group(1),
        )


# Idempotently enroll a tenant Vault Disaster Recovery (live mode)
def ensure_enrolled_in_live_vdr(tenant):
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
        # Won't be used in comparison.
        namespace="unknown",
    )

    # Compare the current configuration with the desired configuration.
    with footprint_dr("status", "--live") as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0
    output = cmd.before.decode()
    got_cfg = EnrollmentConfig.parse_from_footprint_dr_status(output)

    # If the configuration is already correct, leave it as is.
    if cfg.client_params_match(got_cfg):
        return got_cfg

    # Otherwise, re-enroll the tenant in Vault Disaster Recovery.
    with footprint_dr("enroll", "--live") as cmd:
        i = cmd.expect_exact(
            [
                r"Re-enrolling will deactivate the current configuration",
                f"Enrolling {tenant.name} (Live) in Vault Disaster Recovery",
            ]
        )
        if i == 0:
            cmd.expect("Type .+ to continue, or anything else to cancel: ")
            cmd.sendline("restart live-mode Vault Disaster Recovery from scratch")

        cmd.expect_exact("Enter org public key (age recipient): ")
        cmd.sendline(cfg.org_public_keys[0])

        cmd.expect_exact(
            "Are you sure you don't want the benefits of a hardware security token?"
        )
        cmd.sendline("y")

        cmd.expect_exact("Add another org public key? [y/n] ")
        cmd.sendline("y")

        cmd.expect_exact("Enter org public key (age recipient): ")
        cmd.sendline(cfg.org_public_keys[1])

        cmd.expect_exact(
            "Are you sure you don't want the benefits of a hardware security token?"
        )
        cmd.sendline("y")

        cmd.expect_exact("Add another org public key? [y/n] ")
        cmd.sendline("y")

        cmd.expect_exact("Enter org public key (age recipient): ")
        cmd.sendline(cfg.org_public_keys[2])

        cmd.expect_exact("Add another org public key? [y/n] ")
        cmd.sendline("n")

        cmd.expect("Enter AWS account ID: ")
        cmd.sendline(cfg.aws_account_id)

        cmd.expect("Enter AWS role name: ")
        cmd.sendline(cfg.aws_role_name)

        cmd.expect("Enter S3 bucket name: ")
        cmd.sendline(cfg.s3_bucket_name)

        outcome = cmd.expect_exact(
            [
                "Verifying configuration... OK",
                # Multiple pytest processes can race against each other to
                # enroll. Only one can win. We verify the configuration below
                # to make sure it's correct and return the true config.
                "Verifying configuration... Failed\r\nError: Already enrolled in Vault Disaster Recovery",
            ]
        )
        enrollment_failed = outcome == 1

        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == (1 if enrollment_failed else 0)

    # Check that the configuration is now correct.
    with footprint_dr("status", "--live") as cmd:
        cmd.expect(pexpect.EOF)
    assert cmd.exitstatus == 0
    output = cmd.before.decode()
    got_cfg = EnrollmentConfig.parse_from_footprint_dr_status(output)
    assert cfg.client_params_match(got_cfg)

    return got_cfg


def validate_decrypted_data(output_dir, expected_data):
    # Validate directory structure.
    got_fp_ids = set(entry.name for entry in output_dir.iterdir())
    expected_fp_ids = set(
        fp_id
        for fp_id, versions in expected_data.items()
        # fp_ids without any vault data are not present in the output.
        if len(versions) > 0
    )
    assert got_fp_ids == expected_fp_ids, f"{got_fp_ids} != {expected_fp_ids}"

    for fp_id in got_fp_ids:
        path = output_dir / fp_id
        got_versions = set(entry.name for entry in path.iterdir())
        expected_versions = set(str(version) for version in expected_data[fp_id])
        assert (
            got_versions == expected_versions
        ), f"{got_versions} != {expected_versions}"

        for version in got_versions:
            path = output_dir / fp_id / version
            got_fields = set(entry.name for entry in path.iterdir())
            expected_fields = set(expected_data[fp_id][int(version)])
            assert got_fields == expected_fields, f"{got_fields} != {expected_fields}"

            for field in got_fields:
                path = output_dir / fp_id / version / field
                pii_file = list(path.iterdir())
                assert len(pii_file) == 1
                pii_file = pii_file[0]

                if field.startswith("document."):
                    assert pii_file.name == "document.png"

                    got_data = pii_file.read_bytes()
                    assert got_data == expected_data[fp_id][int(version)][field]
                else:
                    assert pii_file.name == "value.txt"

                    got_data = pii_file.read_text()
                    assert got_data == expected_data[fp_id][int(version)][field]


def new_records_file(tmp_path_factory, records):
    path = tmp_path_factory.mktemp("records") / "records.jsonl"
    with path.open("w") as f:
        for record in records:
            f.write(json.dumps(record) + "\n")

            # Include some extra whitespace to test that it's ignored.
            f.write("   \n")
    return path


def new_output_dir(tmp_path_factory):
    return tmp_path_factory.mktemp("output")


def new_org_identity_file(tmp_path_factory, identity):
    path = tmp_path_factory.mktemp("keys") / "keys.txt"
    with path.open("w") as f:
        f.write(identity)
    return path
