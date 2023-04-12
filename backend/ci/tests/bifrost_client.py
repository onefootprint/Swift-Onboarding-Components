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
    post,
    put,
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
        override_inherit_phone_number=None,
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
        if override_inherit_phone_number:
            auth = inherit_user(twilio, override_inherit_phone_number, ob_config_auth)
            self.auth_token = auth
            phone_number = override_inherit_phone_number
        else:
            user = create_basic_sandbox_user(
                twilio,
                ob_config_auth=ob_config_auth,
                suffix=sandbox_suffix,
            )
            self.auth_token = user.auth_token
            phone_number = user.phone_number

        suffix = phone_number.split("#")[-1]
        self.data = {
            **ID_DATA,
            **BUSINESS_DATA,
            **IP_DATA,
            "business.name": f'{BUSINESS_DATA["business.name"]} {suffix}',
            "document.finra_compliance_letter": multipart_file(
                "example_pdf.pdf", "application/pdf"
            ),
            "id.ssn9": _gen_random_ssn(),
            "id.phone_number": phone_number,
            "id.email": f"{EMAIL}#{suffix}",
        }

        # After running bifrost, this will be the list of requirements satisfied
        self.handled_requirements = []

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

        self.handled_requirements = requirements_to_handle
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

    def handle_collect_user(self, requirement):
        """
        PUT data in the vault to satisfy the provided requirement.
        Operates on collect_data or collect_investor_profile requirement
        """
        dis_to_provide = [
            di for cdo in requirement["missing_attributes"] for di in CDO_TO_DIS[cdo]
        ]
        data = {di: v for (di, v) in self.data.items() if di in dis_to_provide}
        put("/hosted/user/vault", data, self.auth_token)

    def handle_collect_business(self, requirement):
        """
        PUT data in the vault to satisfy the provided requirement.
        Operates on collect_business_data requirement
        """
        dis_to_provide = [
            di for cdo in requirement["missing_attributes"] for di in CDO_TO_DIS[cdo]
        ]
        data = {di: v for (di, v) in self.data.items() if di in dis_to_provide}
        body = put("/hosted/business/vault", data, self.auth_token)
        # TODO don't save this here after we stop returning the secondary BO auth tokens
        self.put_business_response = body

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

    def validate(self, validation_token):
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
        validation_token = self.authorize()
        (fp_id, fp_bid) = self.validate(validation_token)

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
