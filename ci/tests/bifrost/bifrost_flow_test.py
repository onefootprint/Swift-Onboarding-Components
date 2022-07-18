import json
import os
import re
from tests.conftest import cleanup
import pytest

from tests.auth import D2pAuth, OnboardingAuth
from tests.constants import EMAIL, PHONE_NUMBER
from tests.utils import _b64_decode, _b64_encode, _gen_random_ssn, try_until_success, _override_webauthn_attestation, _override_webauthn_challenge, get, post
from tests.webauthn_simulator import SoftWebauthnDevice
from collections import defaultdict


WEBAUTHN_DEVICE = SoftWebauthnDevice()

def pytest_namespace():
    # Normally, we wouldn't write tests that share data between them. Since the onboarding flow
    # is so long, there's benefit in splitting it into separate tests and passing info between
    # them
    return {"fpuser_auth_token": None, "fp_user_id": None, "challenge_token": None}


class TestBifrost:
    def test_cleanup_user(self):
        # Cleanup the non-sandbox user that is used across all integration test runs
        cleanup(PHONE_NUMBER, EMAIL)

    def test_identify_email(self):
        identifier = {"email": EMAIL}
        data = {"identifier": identifier, "preferred_challenge_kind": "sms"}

        # First try identifying with an email. The user won't exist
        body = post("identify", data)
        assert not body["data"]["user_found"]
        assert not body["data"].get("challenge_data", dict())

    def test_identify_phone(self):
        identifier = {"phone_number": PHONE_NUMBER}
        data = {"identifier": identifier, "preferred_challenge_kind": "sms"}

        body = post("identify", data)
        assert not body["data"]["user_found"]
        assert not body["data"].get("challenge_data", dict())


    def test_identify_challenge(self, twilio):
        data = {"phone_number": PHONE_NUMBER}
        body = post("identify/challenge", data)
        pytest.challenge_token = body["data"]["challenge_token"]
        def identify_verify():
            message = twilio.messages.list(to=PHONE_NUMBER, limit=1)[0]
            code = str(re.search("\\d{6}", message.body).group(0))
            
            data = {
                "challenge_response": code,
                "challenge_kind": "sms",
                "challenge_token": pytest.challenge_token,
            }
            body = post("identify/verify", data)
            assert body["data"]["kind"] == "user_created"
            auth_token = body["data"]["auth_token"]
            pytest.fpuser_auth_token = OnboardingAuth(auth_token)
        try_until_success(identify_verify, 5)

    def test_onboard_init(self, workos_tenant):
        body = post("onboarding", None, workos_tenant.pk, pytest.fpuser_auth_token)
        assert set(body["data"]["missing_attributes"]) == {"first_name", "last_name", "dob", "ssn", "street_address", "city", "state", "zip", "country", "email"}
        assert body["data"]["missing_webauthn_credentials"] == True

    def test_user_data(self):
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
                "address": {
                    "street_address": "1 Footprint Way",
                    "street_address_2": "PO Box Wallaby Way",
                },
                "city": "Enclave",
                "state": "NY",
                "zip": "10009",
                "country": "US",
            },
            "ssn": _gen_random_ssn(),
            "email": EMAIL,
        } 
        post("user/data", data, pytest.fpuser_auth_token)

        # Issue a second POST /user/data request to update some fields
        data = {
            "name": {
                "first_name": "Flerp2",
                "last_name": "Derp2",
            }
        }
        post("user/data", data, pytest.fpuser_auth_token)

    def test_user_biometric(self):    
        # get challenge
        body = post("user/biometric/init", None, pytest.fpuser_auth_token)
        chal_token = body["data"]["challenge_token"]
        chal = _override_webauthn_challenge(json.loads(body["data"]["challenge_json"]))
        attestation = WEBAUTHN_DEVICE.create(chal, os.environ.get('TEST_URL'))
        attestation = _override_webauthn_attestation(attestation)

        # Register credential
        data = dict(challenge_token=chal_token, device_response_json=json.dumps(attestation))
        post("user/biometric", data, pytest.fpuser_auth_token)

    def test_d2p(self):
        # Get new auth token in d2p/generate endpoint
        body = post("onboarding/d2p/generate", None, pytest.fpuser_auth_token)
        d2p_auth_token = D2pAuth(body["data"]["auth_token"])

        # Send the d2p token to the user via SMS
        data = dict(base_url="https://onefootprint.com/")
        post("onboarding/d2p/sms", data, d2p_auth_token)

        def _update_status(status, status_code=200):
            post("onboarding/d2p/status", dict(status=status), d2p_auth_token, status_code=status_code)

        def _assert_get_status(expected_status):
            body = get("onboarding/d2p/status", None, d2p_auth_token)
            assert body["data"]["status"] == expected_status

        # Use the auth token to check the status of the d2p session
        _assert_get_status("waiting")

        # Make sure the auth token can be used to add a biometric credential
        _update_status("in_progress")

        body = post("user/biometric/init", None, d2p_auth_token)
        assert body["data"]["challenge_token"]

        # Check that the status is updated
        _update_status("completed")
        _assert_get_status("completed")

        # Don't allow transitioning the status backwards
        _update_status("canceled", status_code=400)

        # Shouldn't be able to use the auth token to add a biometric unless it's in in_progress
        body = post("user/biometric/init", None, d2p_auth_token, status_code=401)

    def test_onboarding_complete(self, workos_tenant): 
        body = post("onboarding/complete", None, workos_tenant.pk, pytest.fpuser_auth_token)
        fp_user_id = body["data"]["footprint_user_id"]
        validation_token = body["data"]["validation_token"]

        assert body["data"]["missing_webauthn_credentials"] == False
        assert fp_user_id
        assert validation_token
        pytest.fp_user_id = fp_user_id

        # test the validate api call
        data = dict(validation_token=validation_token)
        body = post("org/validate", data, workos_tenant.sk)
        fp_user_id2 = body["data"]["footprint_user_id"]
        assert fp_user_id2 == fp_user_id
        assert body["data"]["status"]

    def test_identify_login_repeat_customer_biometric(self):
        pytest.fpuser_auth_token = None  # Remove fpuser_auth_token from previous test

        # Identify the user by email
        identifier = {"email": EMAIL}
        data = {"identifier": identifier, "preferred_challenge_kind": "biometric"}
        body = post("identify", data)
        assert body["data"]["user_found"]
        assert body["data"]["challenge_data"]["phone_number_last_two"] == PHONE_NUMBER[-2:]
        assert body["data"]["challenge_data"]["phone_country"] == "US"
        assert body["data"]["challenge_data"]["challenge_kind"] == "biometric"
        assert body["data"]["challenge_data"]["biometric_challenge_json"]
    
        # do webauthn
        chal = json.loads(body["data"]["challenge_data"]["biometric_challenge_json"])

        # override chal here
        # TODO simplify
        chal["publicKey"]["challenge"] = _b64_decode(chal["publicKey"]["challenge"])

        webauthn_device = WEBAUTHN_DEVICE
        attestation = webauthn_device.get(chal, os.environ.get('TEST_URL'))
        attestation["rawId"] = _b64_encode(attestation["rawId"])
        attestation["id"] = _b64_encode(attestation["id"])
        attestation["response"]["authenticatorData"] = _b64_encode(attestation["response"]["authenticatorData"] )
        attestation["response"]["signature"] = _b64_encode(attestation["response"]["signature"] )
        attestation["response"]["userHandle"] = _b64_encode(attestation["response"]["userHandle"] )
        attestation["response"]["clientDataJSON"] = _b64_encode(attestation["response"]["clientDataJSON"] )

        # Log in as the user
        data = {
            "challenge_response": json.dumps(attestation),
            "challenge_kind": "biometric",
            "challenge_token": body["data"]["challenge_data"]["challenge_token"],
        }
        body = post("identify/verify", data)
        assert body["data"]["kind"] == "user_inherited"

    def test_identify_repeat_customer(self, foo_tenant, twilio):
        pytest.fpuser_auth_token = None  # Remove fpuser_auth_token from previous test

        # Identify the user by email
        identifier = {"email": EMAIL}
        data = {"identifier": identifier, "preferred_challenge_kind": "sms"}

        def identify():
            body = post("identify", data)
            assert body["data"]["user_found"]
            assert body["data"]["challenge_data"]["phone_number_last_two"] == PHONE_NUMBER[-2:]
            assert body["data"]["challenge_data"]["challenge_kind"] == "sms"
            return body["data"]["challenge_data"]["challenge_token"]
        challenge_token = try_until_success(identify, 20)

        # Log in as the user
        def identify_verify():
            message = twilio.messages.list(to=PHONE_NUMBER, limit=1)[0]
            code = str(re.search("\\d{6}", message.body).group(0))
            data = {
                "challenge_response": code,
                "challenge_kind": "sms",
                "challenge_token": challenge_token,
            }
            body = post("identify/verify", data)
            assert body["data"]["kind"] == "user_inherited"
            auth_token = body["data"]["auth_token"]
            pytest.fpuser_auth_token = OnboardingAuth(auth_token)
        try_until_success(identify_verify, 5)

        # Start onboarding for user
        body = post("onboarding", None, foo_tenant.pk, pytest.fpuser_auth_token)
        assert not body["data"]["missing_attributes"]

        # complete onboarding for user
        body = post("onboarding/complete", None, foo_tenant.pk, pytest.fpuser_auth_token)
        validation_token = body["data"]["validation_token"]
        assert validation_token

        # test the validate api call
        data = dict(validation_token=validation_token)
        body = post("org/validate", data, foo_tenant.sk)
        fp_user_id2 = body["data"]["footprint_user_id"]
        assert pytest.fp_user_id != fp_user_id2, "Different tenants should have different fp_user_ids"