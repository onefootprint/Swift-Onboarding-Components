import json
import os
import pytest

from tests.constants import (
    EMAIL,
    PHONE_NUMBER,
)
from tests.auth import FpAuth, OnboardingSessionToken
from tests.bifrost_client import BifrostClient
from tests.utils import (
    _b64_decode,
    _b64_encode,
    _gen_random_ssn,
    try_until_success,
    override_webauthn_attestation,
    override_webauthn_challenge,
    get,
    post,
    clean_up_user,
    identify_verify,
    get_requirement_from_requirements,
    create_ob_config,
    inherit_user,
)

from tests.webauthn_simulator import SoftWebauthnDevice


WEBAUTHN_DEVICE = SoftWebauthnDevice()


@pytest.fixture(scope="module")
def non_sandbox_auth_token(twilio, tenant):
    # Test the SMS challenge flow, return the resulting auth token of the user created with the number
    data = dict(phone_number=PHONE_NUMBER)

    def initiate_challenge():
        body = post("hosted/identify/signup_challenge", data)
        return body["challenge_data"]["challenge_token"]

    challenge_token = try_until_success(initiate_challenge, 5)

    return try_until_success(
        lambda: identify_verify(
            twilio, PHONE_NUMBER, challenge_token, tenant.default_ob_config.key
        ),
        5,
    )


def create_inherited_non_sandbox_user(twilio, tenant_auth):
    """
    Completes identify flow to get an auth token for the single integration test non-sandbox user
    using the specified tenant auth
    """
    return inherit_user(twilio, PHONE_NUMBER, tenant_auth)


@pytest.fixture(scope="module")
def ob_session_token(tenant):
    data = {"onboarding_config_id": tenant.default_ob_config.id}
    body = post("onboarding/session", data, tenant.sk.key)
    return OnboardingSessionToken(body["session_token"])


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
        )

        # First try identifying with an email. The user won't exist
        body = post("hosted/identify", data)
        assert not body["user_found"]
        assert not body["available_challenge_kinds"]

    @pytest.mark.parametrize("token_type", ["publishable", "session"])
    def test_onboarding_init(
        self,
        tenant,
        non_sandbox_auth_token,
        token_type,
        ob_session_token,
    ):
        ob_auth = {
            "publishable": tenant.default_ob_config.key,
            "session": ob_session_token,
        }[token_type]
        body = post(
            "hosted/onboarding",
            None,
            ob_auth,
            non_sandbox_auth_token,
        )
        assert not body["validation_token"]
        # Try again to make sure this endpoint is idempotent
        body = post(
            "hosted/onboarding",
            None,
            ob_auth,
            non_sandbox_auth_token,
        )
        assert not body["validation_token"]

        body = get("hosted/onboarding/status", None, non_sandbox_auth_token)

        req = lambda kind: next(r for r in body["requirements"] if r["kind"] == kind)

        collect_data_req = req("collect_data")
        expected = set({"name", "dob", "ssn9", "full_address", "email"})
        assert set(collect_data_req["missing_attributes"]) == expected

        # requirements are non-null, so we expect this to be None
        authorize_fields = body["fields_to_authorize"]
        assert not authorize_fields

        assert req("identity_check")
        assert req("liveness")

        # Shouldn't be able to complete the onboarding until user data is provided
        post(
            "hosted/onboarding/authorize",
            None,
            tenant.default_ob_config.key,
            non_sandbox_auth_token,
            status_code=400,
        )

    @pytest.mark.parametrize(
        "must_collect_identity_document,must_collect_selfie,can_access_identity_document_images,can_access_selfie_image",
        [
            (True, True, True, True),
            (True, False, True, False),
            (True, True, False, False),
            (False, False, False, False),
        ],
    )
    def test_onboarding_config_document_requirements(
        self,
        tenant,
        must_collect_data,
        can_access_data,
        twilio,
        non_sandbox_auth_token,
        must_collect_identity_document,
        must_collect_selfie,
        can_access_identity_document_images,
        can_access_selfie_image,
    ):
        # Not used in test, but want to make sure the user has been created before running this test
        non_sandbox_auth_token

        # Create an ob_config

        ob_conf_data = {
            "name": "Flerp Config",
            "must_collect_data": must_collect_data,
            "can_access_data": can_access_data,
            "must_collect_identity_document": must_collect_identity_document,
            "must_collect_selfie": must_collect_selfie,
            "can_access_identity_document_images": can_access_identity_document_images,
            "can_access_selfie_image": can_access_selfie_image,
        }
        ob_config = create_ob_config(tenant.sk, ob_conf_data)

        # The new ob_config retrieved via org/onboarding_configs has the correct doc requirements
        onboarding_configs_res = get("org/onboarding_configs", None, tenant.sk.key)
        listed_ob_config = next(
            obc for obc in onboarding_configs_res["data"] if obc["id"] == ob_config.id
        )
        assert (
            listed_ob_config["must_collect_identity_document"]
            == must_collect_identity_document
        )
        assert listed_ob_config["must_collect_selfie"] == must_collect_selfie
        assert (
            listed_ob_config["can_access_identity_document_images"]
            == can_access_identity_document_images
        )
        assert listed_ob_config["can_access_selfie_image"] == can_access_selfie_image

        # Create a user and begin onboarding
        auth_token = create_inherited_non_sandbox_user(
            twilio,
            ob_config.key,
        )

        post(
            "hosted/onboarding",
            None,
            ob_config.key,
            auth_token,
        )

        # The correct doc requirements are given by hosted/onboarding/status
        body = get("hosted/onboarding/status", None, auth_token)
        collect_document_req = get_requirement_from_requirements(
            "collect_document", body["requirements"]
        )
        if must_collect_identity_document:
            assert collect_document_req["should_collect_selfie"] == must_collect_selfie
        else:
            assert collect_document_req is None

    def test_skip_liveness(self, non_sandbox_auth_token, tenant):
        # Liveness requirement exists
        body = get(
            "hosted/onboarding/status",
            None,
            tenant.default_ob_config.key,
            non_sandbox_auth_token,
        )
        assert list(r for r in body["requirements"] if r["kind"] == "liveness")

        post(
            "hosted/onboarding/skip_liveness",
            None,
            tenant.default_ob_config.key,
            non_sandbox_auth_token,
        )

        # After skipping, liveness requirement does not exist
        body = get(
            "hosted/onboarding/status",
            None,
            tenant.default_ob_config.key,
            non_sandbox_auth_token,
        )
        assert not list(r for r in body["requirements"] if r["kind"] == "liveness")

    def test_user_data(self, non_sandbox_auth_token):
        # Test failed validation
        data = {
            "email": "flerpderp",
            "speculative": True,
        }
        post("hosted/user/email", data, non_sandbox_auth_token, status_code=400)

        # Test validating data before setting
        data = {
            "id.first_name": "Flerp",
            "id.last_name": "Derp",
            "id.dob": "1995-12-25",
            "id.address_line1": "1 Footprint Way",
            "id.address_line2": "",
            "id.city": "Enclave",
            "id.state": "NY",
            "id.zip": "10009",
            "id.country": "US",
            "id.ssn9": _gen_random_ssn(),
        }
        post("hosted/user/data/identity/validate", data, non_sandbox_auth_token)

        # Actually set the data
        post("hosted/user/data/identity", data, non_sandbox_auth_token)

        # Should be allowed to update speculative fields that are already set
        data = {
            "id.first_name": "Flerp2",
            "id.last_name": "Derp2",
        }
        post("hosted/user/data/identity", data, non_sandbox_auth_token)

    def test_add_email(self, non_sandbox_auth_token):
        post("hosted/user/email", {"email": EMAIL}, non_sandbox_auth_token)

    def test_d2p_biometric(self, non_sandbox_auth_token):
        # Try generating tokens with no metadata for backwards compatibility
        post("hosted/onboarding/d2p/generate", None, non_sandbox_auth_token)
        post("hosted/onboarding/d2p/generate", dict(), non_sandbox_auth_token)
        # Get new auth token in d2p/generate endpoint
        meta = dict(opener="mobile")
        body = post(
            "hosted/onboarding/d2p/generate", dict(meta=meta), non_sandbox_auth_token
        )
        d2p_auth_token = FpAuth(body["auth_token"])

        # Send the d2p token to the user via SMS
        data = dict(url="https://onefootprint.com/#{}".format(d2p_auth_token))
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
            assert body["status"] == expected_status
            assert body["meta"] == meta

        # Use the auth token to check the status of the d2p session
        _assert_get_status("waiting")

        # Add a biometric credential using the token
        _update_status("in_progress")
        body = post("hosted/user/biometric/init", None, d2p_auth_token)
        chal_token = body["challenge_token"]
        chal = override_webauthn_challenge(json.loads(body["challenge_json"]))
        attestation = WEBAUTHN_DEVICE.create(chal, os.environ.get("TEST_URL"))
        attestation = override_webauthn_attestation(attestation)

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

    def test_onboarding_kyc(self, tenant, non_sandbox_auth_token):
        body = get(
            "hosted/onboarding/kyc",
            None,
            tenant.default_ob_config.key,
            non_sandbox_auth_token,
        )
        assert body["status"] == "pending"

        post(
            "hosted/onboarding/submit",
            None,
            tenant.default_ob_config.key,
            non_sandbox_auth_token,
        )

        body = get(
            "hosted/onboarding/kyc",
            None,
            tenant.default_ob_config.key,
            non_sandbox_auth_token,
        )
        assert body["status"] == "complete"

    def test_onboarding_authorize(self, tenant, non_sandbox_auth_token):
        body = post(
            "hosted/onboarding/authorize",
            None,
            tenant.default_ob_config.key,
            non_sandbox_auth_token,
        )
        validation_token = body["validation_token"]

        assert validation_token

        # test the validate api call
        data = dict(validation_token=validation_token)
        body = post("onboarding/session/validate", data, tenant.sk.key)
        assert body["footprint_user_id"]
        assert body["status"]

    def test_onboard_onto_same_ob_config(self, tenant, non_sandbox_auth_token):
        body = post(
            "hosted/onboarding",
            None,
            tenant.default_ob_config.key,
            non_sandbox_auth_token,
        )
        validation_token = body["validation_token"]
        data = dict(validation_token=validation_token)
        body = post("onboarding/session/validate", data, tenant.sk.key)
        assert body["footprint_user_id"]

        # We won't ever actually hit onboarding/authorize if the tenant has already onboarded,
        # but if we do, we should no-op and succeed
        body = post(
            "hosted/onboarding/authorize",
            None,
            tenant.default_ob_config.key,
            non_sandbox_auth_token,
        )
        validation_token = body["validation_token"]
        data = dict(validation_token=validation_token)
        body = post("onboarding/session/validate", data, tenant.sk.key)
        footprint_user_id = body["footprint_user_id"]
        assert footprint_user_id

        body = get(f"users/{footprint_user_id}/timeline", None, tenant.sk.key)
        assert len(body) > 0

    def test_identify_login_repeat_customer_biometric(self, non_sandbox_auth_token):
        # Not used in test, but want to make sure the user has been created before running this test
        non_sandbox_auth_token
        # Identify the user by email
        identifier = {"email": EMAIL}
        data = dict(
            identifier=identifier,
        )
        body = post("hosted/identify", data)
        assert body["user_found"]
        assert set(body["available_challenge_kinds"]) == {"sms", "biometric"}

        data = dict(
            identifier=identifier,
            preferred_challenge_kind="biometric",
        )
        body = post("hosted/identify/login_challenge", data)
        assert body["challenge_data"]["phone_number_last_two"] == PHONE_NUMBER[-2:]
        assert body["challenge_data"]["phone_country_code"] == "+1"
        assert body["challenge_data"]["challenge_kind"] == "biometric"
        assert body["challenge_data"]["biometric_challenge_json"]

        # do webauthn
        chal = json.loads(body["challenge_data"]["biometric_challenge_json"])

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
            "challenge_token": body["challenge_data"]["challenge_token"],
        }
        body = post("hosted/identify/verify", data)
        assert body["kind"] == "user_inherited"

    def test_identify_login_repeat_customer_no_challenge(self, non_sandbox_auth_token):
        # Not used in test, but want to make sure the user has been created before running this test
        non_sandbox_auth_token
        # Identify the user by email
        identifier = {"email": EMAIL}
        data = dict(
            identifier=identifier,
        )
        body = post("hosted/identify", data)
        assert body["user_found"]
        assert set(body["available_challenge_kinds"]) == {"sms", "biometric"}

    # In this test we
    #   - Create a live user by re-using a previously challenged phone number
    #   - onboard users onto a tenant, with an 2 separate ob_configs that asks for a document
    #   - submit documents
    #       - Since not all documents have backs, we check a submission with front/back and only front
    #   - expect the status of the document request to be pending
    # Other steps we should test (see TODOs on the API route)
    #   - document request moves into UPLOADED after post
    #   - after document request gets moved out of PENDING, requirement is no longer there
    @pytest.mark.parametrize(
        "test_name",
        [("both"), ("front_only")],
    )
    def test_onboarding_requiring_document(
        self,
        twilio,
        non_sandbox_auth_token,
        test_name,
        # TODO: For now, need two separate tenants since we use the same user. Can change this once
        # we start allowing multiple ScopedUsers per tenant
        doc_request_ob_config,
        doc_request_ob_config2,
    ):
        # Not used but need to create the fixture
        non_sandbox_auth_token
        from .image_fixtures import test_image

        # This is non-ideal, but creating new users integration tests is a little tricky at the moment
        # so we create multiple onboarding configurations/onboardings to test what we are trying to test
        doc_data_both = {
            "front_image": test_image,
            "back_image": test_image,
            "document_type": "passport",
            "country_code": "USA",
        }
        doc_data_only_front = {
            "front_image": test_image,
            "back_image": None,
            "document_type": "passport",
            "country_code": "USA",
        }

        data = {
            "both": doc_data_both,
            "front_only": doc_data_only_front,
        }[test_name]
        ob_config_key = {
            "both": doc_request_ob_config.key,
            "front_only": doc_request_ob_config2.key,
        }[test_name]

        # Log in as the user
        auth_token = create_inherited_non_sandbox_user(
            twilio,
            ob_config_key,
        )

        # Onboard a user onto a tenant that requests a document
        post(
            "hosted/onboarding",
            None,
            ob_config_key,
            auth_token,
        )

        body = get(
            "hosted/onboarding/status",
            None,
            ob_config_key,
            auth_token,
        )

        # We have a requirement
        req = get_requirement_from_requirements(
            "collect_document", body["requirements"]
        )
        assert req
        # stash the request id
        document_request_id = req["document_request_id"]

        # Submit the document
        post_body = post(
            f"hosted/user/document",
            data,
            auth_token,
            ob_config_key,
        )

        assert post_body == {}

        # get status.
        # We always move to complete now, this will change once we have vendor integrations
        expected = {
            "status": {"kind": "complete"},
            "errors": [],
            "front_image_error": None,
            "back_image_error": None,
        }

        get_body = get(
            f"hosted/user/document/status",
            None,
            auth_token,
            ob_config_key,
        )

        assert get_body == expected


class TestBifrostSandbox:
    @pytest.mark.parametrize(
        "suffix,expected_status,expected_requires_manual_review",
        [
            ("fail", "fail", False),
            ("blah_123", "pass", False),
            ("manualreview", "fail", True),
        ],
    )
    def test_deterministic_onboarding(
        self,
        twilio,
        sandbox_tenant,
        suffix,
        expected_status,
        expected_requires_manual_review,
    ):
        bifrost_client = BifrostClient(sandbox_tenant.default_ob_config)
        bifrost_client.init_user_for_onboarding(twilio, sandbox_suffix=suffix)
        user = bifrost_client.onboard_user_onto_tenant(sandbox_tenant)

        # Get the status
        body = post(
            "onboarding/session/validate",
            dict(validation_token=user.validation_token),
            sandbox_tenant.sk.key,
        )
        assert body["status"] == expected_status
        assert body["requires_manual_review"] == expected_requires_manual_review
