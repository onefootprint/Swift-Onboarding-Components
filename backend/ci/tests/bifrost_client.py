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
        self.user_data = build_user_data()

    def init_user_for_onboarding(self, twilio, sandbox_suffix=None, document_data=None):
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
        self.document_data = document_data
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

        if self.document_data.has_back():
            data["back_image"] = test_image

        if self.document_data.has_selfie():
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
        """Get the fp_user_id"""
        body = post(
            "onboarding/session/validate",
            dict(validation_token=validation_token),
            tenant_sk.key,
        )
        return body["footprint_user_id"]

    def onboard_user_onto_tenant(self, tenant):
        """
        Onboards a user onto a tenant. See individual methods for more information
        """
        assert (
            self.auth_token and self.phone_number
        ), "please call init_user_for_onboarding() before calling onboard_user_onto_tenant"

        sandbox_email = _sandbox_email(self.phone_number)
        self.add_email(sandbox_email)

        # Start an onboarding
        self.initialize_onboarding()
        # Add identity data
        self.add_identity_data()
        # Liveness
        self.register_biometric_credentials()
        # Identity Document data, if applicable
        if self.document_data is not None:
            self.add_identity_document_data()
        # Retrieve validation token
        validation_token = self.authorize_user_to_tenant()
        # User validation token to get a persistent token the tenant's can use
        fp_user_id = self.validate_user(validation_token, tenant.sk)

        return User(
            auth_token=self.auth_token,
            fp_user_id=fp_user_id,
            first_name=self.user_data["id.first_name"],
            last_name=self.user_data["id.last_name"],
            address_line1=self.user_data["id.address_line1"],
            address_line2=self.user_data["id.address_line2"],
            zip=self.user_data["id.zip"],
            city=self.user_data["id.city"],
            state=self.user_data["id.state"],
            country=self.user_data["id.country"],
            ssn=self.user_data["id.ssn9"],
            phone_number=self.phone_number,
            real_phone_number=self.phone_number.split("#")[0],
            email=sandbox_email,
            validation_token=validation_token,
            tenant=tenant,
        )
