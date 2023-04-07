import json
from typing import NamedTuple
from tests.types import Tenant
from tests.constants import TEST_URL, ID_DATA, BUSINESS_DATA, IP_DATA, CDO_TO_DIS
from tests.webauthn_simulator import SoftWebauthnDevice
from tests.utils import (
    multipart_file,
    _sandbox_email,
    _gen_random_ssn,
    create_basic_sandbox_user,
    get,
    post,
    put,
    override_webauthn_challenge,
    override_webauthn_attestation,
)


class BifrostClient:
    """
    BifrostClient simulates Footprint hosted frontend's requests to the backend APIs.
    """

    def __init__(self, ob_config, twilio, sandbox_suffix=None):
        """
        Creates a BifrostClient associated with a specific ob config and a specific user with
        default data populated.

        Can override any data with BifrostClient.data.
        """
        self.ob_config = ob_config
        # Generate all default data up front. Pluck from it to satisfy requirements
        # Now, we do the old init_for_onboarding in the constructor

        user = create_basic_sandbox_user(
            twilio,
            tenant_pk=self.ob_config.key,
            suffix=sandbox_suffix,
        )
        self.auth_token = user.auth_token

        self.data = {
            **ID_DATA,
            **BUSINESS_DATA,
            **IP_DATA,
            "document.finra_compliance_letter": multipart_file(
                "example_pdf.pdf", "application/pdf"
            ),
            "id.ssn9": _gen_random_ssn(),
            "id.phone_number": user.phone_number,
            "id.email": _sandbox_email(user.phone_number),
        }

        # Initialize the onboarding
        post("hosted/onboarding", None, self.auth_token)

    def get_requirements(self):
        return get("hosted/onboarding/status", None, self.auth_token)["requirements"]

    def handle_requirements(self, kind=None):
        """
        Handle all onboarding requirements.
        If `kind` is provided, will only handle the requested requirement
        """
        requirements = self.get_requirements()
        requirements_to_handle = (
            requirements
            if not kind
            else next(i for i in requirements if i["kind"] == kind)
        )

        for req in requirements_to_handle:
            self.handle_requirement(req)

    def handle_requirement(self, requirement):
        """
        Simulates behavior of the bifrost app - given a requirement, we handle it by prompting the
        user to input a specific piece of information.
        """
        if requirement["kind"] == "collect_data":
            self.handle_collect(requirement, "/hosted/user/vault")
        elif requirement["kind"] == "collect_investor_profile":
            self.handle_collect(requirement, "/hosted/user/vault")
            self.handle_ip_doc()
        elif requirement["kind"] == "collect_business_data":
            self.handle_collect(requirement, "/hosted/business/vault")
        elif requirement["kind"] == "collect_document":
            self.handle_collect_document(requirement)
        elif requirement["kind"] == "liveness":
            self.handle_liveness()

    def handle_collect(self, requirement, url):
        """
        PUT data in the vault to satisfy the provided requirement.
        Operates on collect_data, collect_investor_profile, or collect_business_data requirements
        """
        dis_to_provide = [
            di for cdo in requirement["missing_attributes"] for di in CDO_TO_DIS[cdo]
        ]
        data = {di: v for (di, v) in self.data.items() if di in dis_to_provide}
        put(url, data, self.auth_token)

    def handle_ip_doc(self):
        """Some special logic to upload a document for certain investor profile options"""
        doc_required_declarations = {"affiliated_with_us_broker", "senior_executive"}
        declarations = json.loads(self.data["investor_profile.declarations"])
        if doc_required_declarations & set(declarations):
            path = "/hosted/user/upload/document.finra_compliance_letter"
            file = self.data["document.finra_compliance_letter"]
            post(path, None, self.auth_token, files=file)

    def handle_collect_document(self, requirement):
        """Add identity documents to vault"""
        from .image_fixtures import test_image

        selfie_image = test_image if requirement["should_collect_selfie"] else None
        data = {
            "front_image": test_image,
            "back_image": test_image,
            "selfie_image": selfie_image,
            "document_type": "driver_license",
            "country_code": "USA",
        }

        if requirement["should_collect_consent"]:
            consent_data = {"consent_language_text": "I consent"}
            post("hosted/user/consent", consent_data, self.auth_token)

        post("hosted/user/document", data, self.auth_token)

    def handle_liveness(self):
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

    def authorize(self):
        body = post("hosted/onboarding/authorize", None, self.auth_token)
        return body["validation_token"]

    def validate(self, validation_token, tenant_sk):
        data = dict(validation_token=validation_token)
        body = post("onboarding/session/validate", data, tenant_sk.key)
        self.validate_response = body
        return body["footprint_user_id"]

    def run(self, tenant):
        """
        Simulates all bifrost logic of satisfying requirements and authorizing.
        """
        self.handle_requirements()
        validation_token = self.authorize()
        fp_id = self.validate(validation_token, tenant.sk)

        return User(
            fp_id=fp_id,
            tenant=tenant,
            client=self,
        )


class User(NamedTuple):
    fp_id: str
    tenant: Tenant
    client: BifrostClient
