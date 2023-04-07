import json
import os
from tests.constants import TEST_URL

from tests.types import User
from tests.webauthn_simulator import SoftWebauthnDevice
from enum import Enum
from tests.utils import (
    _sandbox_email,
    create_basic_sandbox_user,
    get,
    post,
    put,
    override_webauthn_challenge,
    override_webauthn_attestation,
    get_requirement_from_requirements,
    build_user_data,
    build_business_data,
)


class DocumentDataOptions(Enum):
    front = 1
    front_back = 2
    front_selfie = 3
    front_back_selfie = 4

    def has_back(self):
        return self in [
            DocumentDataOptions.front_back,
            DocumentDataOptions.front_back_selfie,
        ]

    def has_selfie(self):
        return self in [
            DocumentDataOptions.front_selfie,
            DocumentDataOptions.front_back_selfie,
        ]


class BifrostClient:
    """
    BifrostClient simulates Footprint hosted frontend's requests to the backend APIs.
    We make requests to the backend with an onboarding configuration public key
    """

    def __init__(self, ob_config):
        self.ob_config = ob_config
        self.business_data = None
        self.user_data = build_user_data()

    def init_user_for_onboarding(
        self, twilio, sandbox_suffix=None, identity_document_data=None
    ):
        """
        Associate a specific instance with a challenged user and data we'd like to simulate submitting
        """
        user = create_basic_sandbox_user(
            twilio,
            tenant_pk=self.ob_config.key,
            suffix=sandbox_suffix,
        )
        self.auth_token = user.auth_token
        self.phone_number = user.phone_number
        self.identity_document_data = identity_document_data
        return self.auth_token

    def initialize_onboarding(self):
        """Initialize the onboarding"""
        post(
            "hosted/onboarding",
            None,
            self.auth_token,
        )

    def add_email(self, sandbox_email):
        email_data = {"id.email": sandbox_email}
        put("hosted/user/vault", email_data, self.auth_token)

    def add_identity_data(self):
        """Add identity data via hosted/user/vault"""
        # TODO: maybe add onboarding id
        # Populate the user's data
        put(
            "hosted/user/vault",
            self.user_data,
            self.auth_token,
        )

    def add_investor_profile(self, data):
        put(
            "hosted/user/vault",
            data,
            self.auth_token,
        )

    def add_business_data(self):
        """Add identity data via hosted/user/vault"""
        put(
            "hosted/business/vault",
            build_business_data(),
            self.auth_token,
        )

    def register_biometric_credentials(self):
        """Register the biometric credential"""
        webauthn_device = SoftWebauthnDevice()
        body = post("hosted/user/biometric/init", None, self.auth_token)
        chal_token = body["challenge_token"]
        chal = override_webauthn_challenge(json.loads(body["challenge_json"]))
        attestation = webauthn_device.create(chal, TEST_URL)
        attestation = override_webauthn_attestation(attestation)
        data = dict(
            challenge_token=chal_token, device_response_json=json.dumps(attestation)
        )
        post("hosted/user/biometric", data, self.auth_token)

    def get_requirements(self):
        return get(
            "hosted/onboarding/status",
            None,
            self.auth_token,
        )["requirements"]

    def add_identity_document_data(self):
        """Add identity documents to vault"""
        from .image_fixtures import test_image

        # We have a requirement
        requirements = self.get_requirements()
        get_requirement_from_requirements("collect_document", requirements)

        data = {
            "front_image": test_image,
            "back_image": None,
            "selfie_image": None,
            "document_type": "passport",
            "country_code": "USA",
        }

        if self.identity_document_data.has_back():
            data["back_image"] = test_image

        if self.identity_document_data.has_selfie():
            data["selfie_image"] = test_image
            post(
                f"hosted/user/consent",
                {"consent_language_text": "I consent"},
                self.auth_token,
            )

        post(
            f"hosted/user/document",
            data,
            self.auth_token,
        )

    def authorize_user_to_tenant(self):
        """Authorize and complete the onboarding"""
        body = post(
            "hosted/onboarding/authorize",
            None,
            self.auth_token,
        )
        return body["validation_token"]

    def validate_user(self, validation_token, tenant_sk):
        """Get the fp_id"""
        body = post(
            "onboarding/session/validate",
            dict(validation_token=validation_token),
            tenant_sk.key,
        )
        return body["footprint_user_id"]

    def upload_document(self, document_file):
        post(
            "/hosted/user/upload/document.finra_compliance_letter",
            None,
            self.auth_token,
            files=document_file,
        )

    def onboard_user_onto_tenant(
        self,
        tenant,
        add_business_data=False,
        investor_profile=None,
        document_files=None,
    ):
        """
        Onboards a user onto a tenant. See individual methods for more information
        """
        assert (
            self.auth_token and self.phone_number
        ), "please call init_user_for_onboarding() before calling onboard_user_onto_tenant"
        # TODO should use GET /status to dynamically determine what requirements are needed
        # TODO might need to set up another twilio number in order to integration test

        sandbox_email = _sandbox_email(self.phone_number)
        self.add_email(sandbox_email)

        self.initialize_onboarding()
        self.add_identity_data()
        if investor_profile:
            self.add_investor_profile(investor_profile)
        if document_files:
            [self.upload_document(d) for d in document_files]
        if add_business_data:
            self.add_business_data()
        self.register_biometric_credentials()
        if self.identity_document_data is not None:
            self.add_identity_document_data()
        validation_token = self.authorize_user_to_tenant()
        fp_id = self.validate_user(validation_token, tenant.sk)

        return User(
            fp_id=fp_id,
            validation_token=validation_token,
            auth_token=self.auth_token,
            tenant=tenant,
            phone_number=self.phone_number,
            email=sandbox_email,
            ssn=self.user_data["id.ssn9"],
        )
