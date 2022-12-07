import json
import os

from .types import User
from .webauthn_simulator import SoftWebauthnDevice

from .utils import (
    _sandbox_email,
    get,
    post,
    override_webauthn_challenge,
    override_webauthn_attestation,
    get_requirement_from_requirements,
)


class InsufficientArgsForOnboarding(Exception):
    pass


class BifrostClient:
    """
    BifrostClient simulates Footprint hosted frontend's requests to the backend APIs
    """

    # Initialize with a tenant (to mimic how bifrost actually works)
    def __init__(self, tenant):
        self.tenant = tenant

    # Associate a specific instance with a challenged user and data we'd like to simulate submitting
    def init_user_for_onboarding(self, basic_user, user_data, document_data=None):
        self.basic_user = basic_user
        self.user_data = user_data
        self.document_data = document_data

    # Initialize the onboarding
    def initialize_onboarding(self, tenant, basic_user):
        post(
            "hosted/onboarding",
            None,
            tenant.ob_config().key,
            basic_user.auth_token,
        )

    def add_email(self, basic_user, sandbox_email):
        email_data = {"email": sandbox_email}
        post("hosted/user/email", email_data, basic_user.auth_token)

    # Add identity data via hosted/user/data/identity
    def add_identity_data(self, basic_user, user_data):
        # TODO: maybe add onboarding id
        # Populate the user's data
        post("hosted/user/data/identity", user_data, basic_user.auth_token)

    # Register the biometric credential
    def register_biometric_credentials(self, basic_user):

        webauthn_device = SoftWebauthnDevice()
        body = post("hosted/user/biometric/init", None, basic_user.auth_token)
        chal_token = body["challenge_token"]
        chal = override_webauthn_challenge(json.loads(body["challenge_json"]))
        attestation = webauthn_device.create(chal, os.environ.get("TEST_URL"))
        attestation = override_webauthn_attestation(attestation)
        data = dict(
            challenge_token=chal_token, device_response_json=json.dumps(attestation)
        )
        post("hosted/user/biometric", data, basic_user.auth_token)

    # add identity documents to vault
    def add_identity_document_data(self, tenant, basic_user, document_data):
        from .image_fixtures import test_image

        body = get(
            "hosted/onboarding/status",
            None,
            tenant.ob_config().key,
            basic_user.auth_token,
        )

        # We have a requirement
        req = get_requirement_from_requirements(
            "collect_document", body["requirements"]
        )
        # stash the request id since we need it for the POST
        document_request_id = req["document_request_id"]

        if document_data == "front_only":
            data = {
                "front_image": test_image,
                "back_image": None,
                "document_type": "passport",
                "country_code": "USA",
            }
        else:
            data = {
                "front_image": test_image,
                "back_image": test_image,
                "document_type": "passport",
                "country_code": "USA",
            }
        post(
            f"hosted/user/document/{document_request_id}",
            data,
            basic_user.auth_token,
            tenant.ob_config().key,
        )

    def submit_collected_data(self, tenant, basic_user):
        # Run the KYC check
        post(
            "hosted/onboarding/submit",
            None,
            tenant.ob_config().key,
            basic_user.auth_token,
        )

    def authorize_user_to_tenant(self, tenant, basic_user):
        # Authorize and complete the onboarding
        body = post(
            "hosted/onboarding/authorize",
            None,
            tenant.ob_config().key,
            basic_user.auth_token,
        )
        return body["validation_token"]

    def validate_user(self, validation_token, tenant):
        # Get the fp_user_id
        body = post(
            "onboarding/session/validate",
            dict(validation_token=validation_token),
            tenant.sk.key,
        )
        return body["footprint_user_id"]

    def onboard_user_onto_tenant(self):
        """
        Onboards a user onto a tenant. See individual methods for more information
        """

        # Simple check, this could be better
        if self.basic_user is None:
            raise InsufficientArgsForOnboarding(
                "please call init_user_for_onboarding() before calling onboard_user_onto_tenant"
            )

        # Start an onboarding
        self.initialize_onboarding(self.tenant, self.basic_user)
        sandbox_email = _sandbox_email(self.basic_user.phone_number)
        self.add_email(self.basic_user, sandbox_email)
        # Add identity data
        self.add_identity_data(self.basic_user, self.user_data)
        # Liveness
        self.register_biometric_credentials(self.basic_user)
        # Identity Document data, if applicable
        if self.document_data is not None:
            self.add_identity_document_data(
                self.tenant, self.basic_user, self.document_data
            )
        # Submit the onboarding via /submit
        self.submit_collected_data(self.tenant, self.basic_user)
        # Retrieve validation token
        validation_token = self.authorize_user_to_tenant(self.tenant, self.basic_user)
        # User validation token to get a persistent token the tenant's can use
        fp_user_id = self.validate_user(validation_token, self.tenant)

        return User(
            auth_token=self.basic_user.auth_token,
            fp_user_id=fp_user_id,
            first_name=self.user_data["name"]["first_name"],
            last_name=self.user_data["name"]["last_name"],
            address_line1=self.user_data["address"]["line1"],
            address_line2=self.user_data["address"]["line2"],
            zip=self.user_data["address"]["zip"],
            city=self.user_data["address"]["city"],
            state=self.user_data["address"]["state"],
            country=self.user_data["address"]["country"],
            ssn=self.user_data["ssn9"],
            phone_number=self.basic_user.phone_number,
            real_phone_number=self.basic_user.real_phone_number,
            email=sandbox_email,
            validation_token=validation_token,
            tenant=self.tenant,
        )
