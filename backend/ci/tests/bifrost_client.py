import json
from typing import NamedTuple, Optional
from tests.types import Tenant
from tests.constants import (
    TEST_URL,
    ID_DATA,
    BUSINESS_DATA,
    IP_DATA,
    CDO_TO_DIS,
    EMAIL,
    DOCUMENT_DATA,
)
from tests.webauthn_simulator import SoftWebauthnDevice
from tests.utils import (
    _random_sandbox_phone,
    multipart_file,
    _gen_random_ssn,
    inherit_user,
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

    def raw_auth(ob_config, auth_token, phone_number):
        """
        Create an instance of BifrostClient that uses the provided auth token.
        """
        return BifrostClient(ob_config, auth_token, phone_number, True, None)

    def inherit(ob_config, twilio, phone_number, override_ob_config_auth=None):
        """
        Create an instance of BifrostClient that inherits the user with the provided phone number.
        """
        ob_config_auth = override_ob_config_auth or ob_config.key
        auth = inherit_user(twilio, phone_number, ob_config_auth)
        return BifrostClient(ob_config, auth, phone_number, True, None)

    def create(
        ob_config,
        twilio,
        phone_number,
        override_ob_config_auth=None,
        override_email=None,
    ):
        """
        Create an instance of BifrostClient that creates a new user with the provided phone number.
        """
        ob_config_auth = override_ob_config_auth or ob_config.key
        auth_token = create_user(twilio, phone_number, ob_config_auth)
        return BifrostClient(ob_config, auth_token, phone_number, False, override_email)

    def new(ob_config, twilio, override_ob_config_auth=None):
        """
        Create an instance of BifrostClient that creates a new user with a new, sandbox phone number
        """
        ob_config_auth = override_ob_config_auth or ob_config.key
        phone_number = _random_sandbox_phone()
        auth_token = create_user(twilio, phone_number, ob_config_auth)
        return BifrostClient(ob_config, auth_token, phone_number, False, None)

    def __init__(
        self,
        ob_config,
        auth_token,
        phone_number,
        is_inherited,
        override_email=None,
    ):
        self.ob_config = ob_config
        self.auth_token = auth_token

        if override_email:
            email = override_email
        else:
            email = EMAIL

        is_sandbox = "#" in phone_number
        if is_sandbox:
            # Edit the email and business name to have the same suffix as the phone number
            suffix = phone_number.split("#")[-1]
            business_name = f'{BUSINESS_DATA["business.name"]} {suffix}'
            email = f"{email}#{suffix}"
        else:
            business_name = BUSINESS_DATA["business.name"]

        self.data = {
            **ID_DATA,
            **BUSINESS_DATA,
            **IP_DATA,
            **DOCUMENT_DATA,
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
        if not is_inherited:
            email_data = {"id.email": self.data["id.email"]}
            post("/hosted/user/vault/validate", email_data, self.auth_token)
            patch("/hosted/user/vault", email_data, self.auth_token)

        # Initialize the onboarding
        self.initialize_onboarding()

    @property
    def decrypted_data(self):
        return {
            **self.data,
            "id.ssn4": self.data["id.ssn9"][-4:],
            "id.email": self.data["id.email"].split("#")[0],
            "id.phone_number": self.data["id.phone_number"]
            .replace(" ", "")
            .split("#")[0],
            # Could add other derived entries here
        }

    def initialize_onboarding(self):
        return post("hosted/onboarding", None, self.auth_token)

    def get_status(self):
        return get("hosted/onboarding/status", None, self.auth_token)

    def handle_requirements(self, kind=None):
        """
        Handle all onboarding requirements.
        If `kind` is provided, will only handle the requested requirement
        """
        self.handled_requirements = []
        while True:
            body = self.get_status()
            requirements = body["requirements"]
            requirements_to_handle = (
                requirements
                if not kind
                else [i for i in requirements if i["kind"] == kind]
            )
            if len(requirements_to_handle) == 0:
                break
            self.handled_requirements.extend(requirements_to_handle)
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
        elif requirement["kind"] == "process":
            # For now, the process requirement is usually handled inline during the handling of other
            # requirements. Will move it out of line.
            # TODO handle this automatically
            # self.handle_process()
            pass
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

        if requirement["should_collect_consent"]:
            consent_data = {"consent_language_text": "I consent"}
            post("hosted/user/consent", consent_data, self.auth_token)

        common_data = {
            "document_type": "driver_license",
            "country_code": "US",
        }
        sides = [
            "front",
            "back",
        ]
        if requirement["should_collect_selfie"]:
            sides.append("selfie")

        # Upload the documents consecutively in separate requests
        for i, side in enumerate(sides):
            image = {f"{side}_image": self.data[f"document.drivers_license.{side}"]}
            data = {**common_data, **image}
            body = post("hosted/user/document", data, self.auth_token)
            next_side = sides[i + 1] if i + 1 < len(sides) else None
            assert body["next_side_to_collect"] == next_side
            assert not body["errors"]

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

    def handle_process(self, **kwargs):
        post("hosted/onboarding/process", None, self.auth_token, **kwargs)

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
