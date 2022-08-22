import json
import os
import pytest

from tests.constants import EMAIL, PHONE_NUMBER
from tests.auth import FpAuth
from tests.utils import (
    _b64_decode,
    _b64_encode,
    _gen_random_ssn,
    try_until_success,
    _override_webauthn_attestation,
    _override_webauthn_challenge,
    get,
    post,
    create_tenant,
    clean_up_user,
    create_basic_user,
    build_user_data,
    identify_verify,
)
from tests.webauthn_simulator import SoftWebauthnDevice


WEBAUTHN_DEVICE = SoftWebauthnDevice()


@pytest.fixture(scope="module")
def auth_token(twilio):
    # Test the SMS challenge flow, return the resulting auth token of the user created with the number
    data = dict(phone_number=PHONE_NUMBER, identify_type="onboarding")
    body = post("hosted/identify/challenge", data)
    challenge_token = body["data"]["challenge_token"]
    return try_until_success(
        lambda: identify_verify(twilio, PHONE_NUMBER, challenge_token), 5
    )


@pytest.fixture(scope="session")
def foo_tenant(must_collect_data, can_access_data):
    org_data = {
        "name": "foo",
        "is_live": True,
    }

    ob_data = {
        "name": "Foo Stocks",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
    }

    return create_tenant(org_data, ob_data)


@pytest.fixture(scope="session")
def bar_tenant(must_collect_data, can_access_data):
    org_data = {
        "name": "bar",
        "is_live": True,
    }

    ob_data = {
        "name": "Bar Insurance",
        "must_collect_data": must_collect_data,
        "can_access_data": can_access_data,
    }

    return create_tenant(org_data, ob_data)


@pytest.fixture(scope="module", autouse="true")
def cleanup():
    # Cleanup the non-sandbox user that is used across all integration test runs
    clean_up_user(PHONE_NUMBER, EMAIL)


class TestBifrost:
    @pytest.mark.parametrize(
        "identifier", [dict(email=EMAIL), dict(phone_number=PHONE_NUMBER)]
    )
    def test_identify_doesnt_exist(self, identifier):
        data = dict(
            identifier=identifier,
            preferred_challenge_kind="sms",
            identify_type="onboarding",
        )

        # First try identifying with an email. The user won't exist
        body = post("hosted/identify", data)
        assert not body["data"]["user_found"]
        assert not body["data"].get("challenge_data", dict())

    def test_onboarding_init(self, workos_tenant, auth_token):
        body = post("hosted/onboarding", None, workos_tenant.ob_config.key, auth_token)
        assert set(body["data"]["missing_attributes"]) == {
            "name",
            "dob",
            "ssn9",
            "full_address",
            "email",
        }
        assert body["data"]["missing_webauthn_credentials"] == True
        assert not body["data"]["validation_token"]

        # Shouldn't be able to complete the onboarding until user data is provided
        post(
            "hosted/onboarding/complete",
            None,
            workos_tenant.ob_config.key,
            auth_token,
            status_code=400,
        )

    def test_user_data(self, auth_token):
        # Test failed validation
        data = {
            "email": "flerpderp",
            "speculative": True,
        }
        post("hosted/user/email", data, auth_token, status_code=400)

        # Test validating data before setting
        data = {
            "name": {
                "first_name": "Flerp",
                "last_name": "Derp",
            },
            "dob": {
                "month": 12,
                "day": 25,
                "year": 1995,
            },
            "address": {
                "line1": "1 Footprint Way",
                "line2": "",
                "city": "Enclave",
                "state": "NY",
                "zip": "10009",
                "country": "US",
            },
            "ssn9": _gen_random_ssn(),
            "speculative": True,
        }
        post("hosted/user/data/identity", data, auth_token)

        # Actually set the data
        data.pop("speculative")
        post("hosted/user/data/identity", data, auth_token)

        # Shouldn't be allowed to update fields that are already set
        data = {
            "name": {
                "first_name": "Flerp2",
                "last_name": "Derp2",
            }
        }
        post("hosted/user/data/identity", data, auth_token, status_code=400)

    def test_add_email(self, auth_token):
        post("hosted/user/email", {"email": EMAIL}, auth_token)

    def test_d2p_biometric(self, auth_token):
        # Get new auth token in d2p/generate endpoint
        body = post("hosted/onboarding/d2p/generate", None, auth_token)
        d2p_auth_token = FpAuth(body["data"]["auth_token"])

        # Send the d2p token to the user via SMS
        data = dict(base_url="https://onefootprint.com/")
        post("hosted/onboarding/d2p/sms", data, d2p_auth_token)

        def _update_status(status, status_code=200):
            post(
                "hosted/onboarding/d2p/status",
                dict(status=status),
                d2p_auth_token,
                status_code=status_code,
            )

        def _assert_get_status(expected_status):
            body = get("hosted/onboarding/d2p/status", None, d2p_auth_token)
            assert body["data"]["status"] == expected_status

        # Use the auth token to check the status of the d2p session
        _assert_get_status("waiting")

        # Add a biometric credential using the token
        _update_status("in_progress")
        body = post("hosted/user/biometric/init", None, d2p_auth_token)
        chal_token = body["data"]["challenge_token"]
        chal = _override_webauthn_challenge(json.loads(body["data"]["challenge_json"]))
        attestation = WEBAUTHN_DEVICE.create(chal, os.environ.get("TEST_URL"))
        attestation = _override_webauthn_attestation(attestation)

        # Register credential
        data = dict(
            challenge_token=chal_token, device_response_json=json.dumps(attestation)
        )
        post("hosted/user/biometric", data, d2p_auth_token)

        # Check that the status is updated
        _update_status("completed")
        _assert_get_status("completed")

        # Don't allow transitioning the status backwards
        _update_status("canceled", status_code=400)

        # Shouldn't be able to add a second biometric credential
        post("hosted/user/biometric/init", None, d2p_auth_token, status_code=400)
        post("hosted/user/biometric", data, d2p_auth_token, status_code=400)

    def test_onboarding_complete(self, workos_tenant, auth_token):
        body = post(
            "hosted/onboarding/complete", None, workos_tenant.ob_config.key, auth_token
        )
        validation_token = body["data"]["validation_token"]

        assert body["data"]["missing_webauthn_credentials"] == False
        assert validation_token

        # test the validate api call
        data = dict(validation_token=validation_token)
        body = post("users/validate", data, workos_tenant.sk.key)
        assert body["data"]["footprint_user_id"]
        assert body["data"]["status"]

    def test_onboard_onto_same_tenant(self, workos_tenant, auth_token):
        body = post("hosted/onboarding", None, workos_tenant.ob_config.key, auth_token)
        assert not body["data"]["missing_attributes"]
        assert not body["data"]["missing_webauthn_credentials"]
        validation_token = body["data"]["validation_token"]
        data = dict(validation_token=validation_token)
        body = post("users/validate", data, workos_tenant.sk.key)
        assert body["data"]["footprint_user_id"]

        # We won't ever actually hit onboarding/complete if the tenant has already onboarded,
        # but if we do, we should no-op and succeed
        body = post(
            "hosted/onboarding/complete", None, workos_tenant.ob_config.key, auth_token
        )
        validation_token = body["data"]["validation_token"]
        data = dict(validation_token=validation_token)
        body = post("users/validate", data, workos_tenant.sk.key)
        assert body["data"]["footprint_user_id"]

    def test_identify_login_repeat_customer_biometric(self, auth_token):
        # Not used in test, but want to make sure the user has been created before running this test
        auth_token
        # Identify the user by email
        identifier = {"email": EMAIL}
        data = dict(
            identifier=identifier,
            preferred_challenge_kind="biometric",
            identify_type="onboarding",
        )
        body = post("hosted/identify", data)
        assert body["data"]["user_found"]
        assert (
            body["data"]["challenge_data"]["phone_number_last_two"] == PHONE_NUMBER[-2:]
        )
        assert body["data"]["challenge_data"]["phone_country"] == "US"
        assert body["data"]["challenge_data"]["challenge_kind"] == "biometric"
        assert body["data"]["challenge_data"]["biometric_challenge_json"]

        # do webauthn
        chal = json.loads(body["data"]["challenge_data"]["biometric_challenge_json"])

        # override chal here
        # TODO simplify
        chal["publicKey"]["challenge"] = _b64_decode(chal["publicKey"]["challenge"])

        webauthn_device = WEBAUTHN_DEVICE
        attestation = webauthn_device.get(chal, os.environ.get("TEST_URL"))
        attestation["rawId"] = _b64_encode(attestation["rawId"])
        attestation["id"] = _b64_encode(attestation["id"])
        attestation["response"]["authenticatorData"] = _b64_encode(
            attestation["response"]["authenticatorData"]
        )
        attestation["response"]["signature"] = _b64_encode(
            attestation["response"]["signature"]
        )
        attestation["response"]["userHandle"] = _b64_encode(
            attestation["response"]["userHandle"]
        )
        attestation["response"]["clientDataJSON"] = _b64_encode(
            attestation["response"]["clientDataJSON"]
        )

        # Log in as the user
        data = {
            "challenge_response": json.dumps(attestation),
            "challenge_kind": "biometric",
            "challenge_token": body["data"]["challenge_data"]["challenge_token"],
        }
        body = post("hosted/identify/verify", data)
        assert body["data"]["kind"] == "user_inherited"

    def test_identify_repeat_customer(self, foo_tenant, bar_tenant, twilio, auth_token):
        # Not used in test, but want to make sure the user has been created before running this test
        auth_token
        # Identify the user by email
        identifier = {"email": EMAIL}
        data = dict(
            identifier=identifier,
            preferred_challenge_kind="sms",
            identify_type="onboarding",
        )

        def identify():
            body = post("hosted/identify", data)
            assert body["data"]["user_found"]
            assert (
                body["data"]["challenge_data"]["phone_number_last_two"]
                == PHONE_NUMBER[-2:]
            )
            assert body["data"]["challenge_data"]["challenge_kind"] == "sms"
            return body["data"]["challenge_data"]["challenge_token"]

        challenge_token = try_until_success(identify, 20)

        # Log in as the user
        auth_token = try_until_success(
            lambda: identify_verify(
                twilio, PHONE_NUMBER, challenge_token, expected_kind="user_inherited"
            ),
            5,
        )

        def onboard_onto_tenant(tenant):
            # Start onboarding for user
            body = post("hosted/onboarding", None, tenant.ob_config.key, auth_token)
            assert not body["data"]["missing_attributes"]

            # complete onboarding for user
            body = post(
                "hosted/onboarding/complete", None, tenant.ob_config.key, auth_token
            )
            validation_token = body["data"]["validation_token"]
            assert validation_token

            # test the validate api call
            data = dict(validation_token=validation_token)
            body = post("users/validate", data, tenant.sk.key)
            return body["data"]["footprint_user_id"]

        foo_fp_user_id = onboard_onto_tenant(foo_tenant)
        bar_fp_user_id = onboard_onto_tenant(bar_tenant)
        assert (
            foo_fp_user_id != bar_fp_user_id
        ), "Onboarding onto different tenants should give different fp_user_id"


class TestBifrostSandbox:
    @pytest.mark.parametrize(
        "suffix,expected_status",
        [
            ("fail", "failed"),
            ("manualreview", "manual_review"),
        ],
    )
    def test_deterministic_onboarding(
        self, twilio, workos_sandbox_tenant, suffix, expected_status
    ):
        basic_user = create_basic_user(twilio, suffix)
        user_data = build_user_data()

        # Initialize the onboarding, poopulate data, complete the onboarding
        post(
            "hosted/onboarding",
            None,
            workos_sandbox_tenant.ob_config.key,
            basic_user.auth_token,
        )
        post("hosted/user/data/identity", user_data, basic_user.auth_token)

        body = post(
            "hosted/onboarding/complete",
            None,
            workos_sandbox_tenant.ob_config.key,
            basic_user.auth_token,
        )
        validation_token = body["data"]["validation_token"]

        # Get the status
        body = post(
            "users/validate",
            dict(validation_token=validation_token),
            workos_sandbox_tenant.sk.key,
        )
        assert body["data"]["status"] == expected_status
