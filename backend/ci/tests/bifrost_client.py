import json
from typing import NamedTuple, Optional
from tests.types import Tenant
from tests.constants import TEST_URL, ID_DATA, BUSINESS_DATA, IP_DATA, CDO_TO_DIS, EMAIL
from tests.webauthn_simulator import SoftWebauthnDevice
from tests.utils import (
    multipart_file,
    _gen_random_ssn,
    inherit_user,
    create_basic_sandbox_user,
    get,
    create_user,
    post,
    patch,
    override_webauthn_challenge,
    override_webauthn_attestation,
)


class BifrostClient:
    """
    BifrostClient simulates Footprint hosted frontend's requests to the backend APIs.
    """

    def __init__(
        self,
        ob_config,
        twilio,
        sandbox_suffix=None,
        override_ob_config_auth=None,
        override_inherit_phone=None,
        override_create_phone=None,
    ):
        """
        Creates a BifrostClient associated with a specific ob config and a specific user with
        default data populated.

        Can override any data with BifrostClient.data.

        Can also override the auth method we use in the identify flow.
        """
        self.ob_config = ob_config
        # Generate all default data up front. Pluck from it to satisfy requirements
        # Now, we do the old init_for_onboarding in the constructor

        ob_config_auth = override_ob_config_auth or self.ob_config.key
        if override_inherit_phone:
            # Inherit the sandbox/prod user
            auth = inherit_user(twilio, override_inherit_phone, ob_config_auth)
            self.auth_token = auth
            phone_number = override_inherit_phone
        elif override_create_phone:
            # Create a user with the given phone number
            self.auth_token = create_user(twilio, override_create_phone, ob_config_auth)
            phone_number = override_create_phone
        else:
            # Create a sandbox user
            user = create_basic_sandbox_user(
                twilio,
                ob_config_auth=ob_config_auth,
                suffix=sandbox_suffix,
            )
            self.auth_token = user.auth_token
            phone_number = user.phone_number

        is_sandbox = "#" in phone_number
        if is_sandbox:
            suffix = phone_number.split("#")[-1]
            business_name = f'{BUSINESS_DATA["business.name"]} {suffix}'
            email = f"{EMAIL}#{suffix}"
        else:
            business_name = BUSINESS_DATA["business.name"]
            email = EMAIL
        self.data = {
            **ID_DATA,
            **BUSINESS_DATA,
            **IP_DATA,
            "document.finra_compliance_letter": multipart_file(
                "example_pdf.pdf", "application/pdf"
            ),
            "id.ssn9": _gen_random_ssn(),
            "business.name": business_name,
            "id.phone_number": phone_number,
            "id.email": email,
        }

        # After running bifrost, this will be the list of requirements satisfied
        self.handled_requirements = []

        # Keep track of biometric credentials created
        self.webauthn_device = SoftWebauthnDevice()

        # Add email data before even initializing the onboarding, which we do on the client side.
        # Inherited users will already have an email
        if not override_inherit_phone:
            email_data = {"id.email": self.data["id.email"]}
            post("/hosted/user/vault/validate", email_data, self.auth_token)
            patch("/hosted/user/vault", email_data, self.auth_token)

        # Initialize the onboarding
        self.initialize_onboarding()

    def initialize_onboarding(self):
        return post("hosted/onboarding", None, self.auth_token)

    def get_status(self):
        return get("hosted/onboarding/status", None, self.auth_token)

    def handle_requirements(self, kind=None):
        """
        Handle all onboarding requirements.
        If `kind` is provided, will only handle the requested requirement
        """
        body = self.get_status()
        requirements = body["requirements"]
        requirements_to_handle = (
            requirements if not kind else [i for i in requirements if i["kind"] == kind]
        )

        self.handled_requirements = requirements_to_handle
        self.already_met_requirements = body["met_requirements"]
        for req in requirements_to_handle:
            self.handle_requirement(req)

    def handle_requirement(self, requirement):
        """
        Simulates behavior of the bifrost app - given a requirement, we handle it by prompting the
        user to input a specific piece of information.
        """
        if requirement["kind"] == "collect_data":
            self.handle_collect_user(requirement)
        elif requirement["kind"] == "collect_investor_profile":
            self.handle_collect_user(requirement)
            self.handle_ip_doc()
        elif requirement["kind"] == "collect_business_data":
            self.handle_collect_business(requirement)
        elif requirement["kind"] == "collect_document":
            self.handle_collect_document(requirement)
        elif requirement["kind"] == "liveness":
            self.handle_liveness()
        elif requirement["kind"] == "authorize":
            self.handle_authorize()
        else:
            kind = requirement["kind"]
            assert False, f"Unknown requirement {kind}"

    def handle_collect_user(self, requirement):
        """
        PATCH data in the vault to satisfy the provided requirement.
        Operates on collect_data or collect_investor_profile requirement
        """
        dis_to_provide = [
            di for cdo in requirement["missing_attributes"] for di in CDO_TO_DIS[cdo]
        ]
        data = {di: v for (di, v) in self.data.items() if di in dis_to_provide}
        post("/hosted/user/vault/validate", data, self.auth_token)
        patch("/hosted/user/vault", data, self.auth_token)

    def handle_collect_business(self, requirement):
        """
        PATCH data in the vault to satisfy the provided requirement.
        Operates on collect_business_data requirement
        """
        dis_to_provide = [
            di for cdo in requirement["missing_attributes"] for di in CDO_TO_DIS[cdo]
        ]
        data = {di: v for (di, v) in self.data.items() if di in dis_to_provide}
        post("/hosted/business/vault/validate", data, self.auth_token)
        patch("/hosted/business/vault", data, self.auth_token)

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

        # Check the status of uploading the doc
        body = get(f"hosted/user/document/status", None, self.auth_token)
        assert body["status"]["kind"] == "complete"
        assert not body["errors"]
        assert not body["front_image_error"]
        assert not body["back_image_error"]

    def handle_liveness(self):
        """Register the biometric credential"""
        body = post("hosted/user/biometric/init", None, self.auth_token)
        chal_token = body["challenge_token"]
        chal = override_webauthn_challenge(json.loads(body["challenge_json"]))
        attestation = self.webauthn_device.create(chal, TEST_URL)
        attestation = override_webauthn_attestation(attestation)
        data = dict(
            challenge_token=chal_token, device_response_json=json.dumps(attestation)
        )
        post("hosted/user/biometric", data, self.auth_token)

    def handle_authorize(self, **kwargs):
        post("hosted/onboarding/authorize", None, self.auth_token, **kwargs)

    def validate(self, **kwargs):
        return post("hosted/onboarding/validate", None, self.auth_token, **kwargs)

    def validate_token(self, validation_token):
        # Use the SK of the tenant that owns the ob config
        tenant_sk = self.ob_config.tenant.sk
        data = dict(validation_token=validation_token)
        body = post("onboarding/session/validate", data, tenant_sk.key)
        self.validate_response = body
        # The response body looks different for business onboardings
        return (body["user"]["fp_id"], body.get("business", {}).get("fp_id"))

    def run(self):
        """
        Simulates all bifrost logic of satisfying requirements and authorizing.
        """
        self.handle_requirements()
        validation_token = self.validate()["validation_token"]
        (fp_id, fp_bid) = self.validate_token(validation_token)

        return User(
            fp_id=fp_id,
            fp_bid=fp_bid,
            tenant=self.ob_config.tenant,
            client=self,
        )


class User(NamedTuple):
    fp_id: str
    fp_bid: Optional[str]
    tenant: Tenant
    client: BifrostClient
