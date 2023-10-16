import json
from typing import NamedTuple, Optional
from tests.headers import SandboxId
from tests.types import Tenant
from tests.constants import (
    TEST_URL,
    ID_DATA,
    BUSINESS_DATA,
    IP_DATA,
    CDO_TO_DIS,
    EMAIL,
    FIXTURE_PHONE_NUMBER,
)
from tests.webauthn_simulator import SoftWebauthnDevice
from tests.utils import (
    _gen_random_sandbox_id,
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

    def raw_auth(ob_config, auth_token, phone_number, sandbox_id):
        """
        Create an instance of BifrostClient that uses the provided auth token.
        """
        return BifrostClient(ob_config, auth_token, phone_number, sandbox_id)

    def inherit(
        ob_config, twilio, phone_number, sandbox_id, override_ob_config_auth=None
    ):
        """
        Create an instance of BifrostClient that inherits the user with the provided phone number.
        """
        ob_config_auth = override_ob_config_auth or ob_config.key
        sandbox_id_header = [SandboxId(sandbox_id)] if sandbox_id else []
        auth = inherit_user(twilio, phone_number, ob_config_auth, *sandbox_id_header)
        return BifrostClient(ob_config, auth, phone_number, sandbox_id)

    def create(
        ob_config,
        twilio,
        phone_number,
        sandbox_id,
        override_ob_config_auth=None,
        override_email=None,
    ):
        """
        Create an instance of BifrostClient that creates a new user with the provided phone number.
        """
        ob_config_auth = override_ob_config_auth or ob_config.key
        sandbox_id_header = [SandboxId(sandbox_id)] if sandbox_id else []
        email = override_email or EMAIL
        auth_token = create_user(
            twilio, phone_number, email, ob_config_auth, *sandbox_id_header
        )
        return BifrostClient(
            ob_config, auth_token, phone_number, sandbox_id, override_email
        )

    def new(ob_config, twilio, override_ob_config_auth=None):
        """
        Create an instance of BifrostClient that creates a new sandbox user with the fixture phone number
        """
        ob_config_auth = override_ob_config_auth or ob_config.key
        sandbox_id = _gen_random_sandbox_id()
        auth_token = create_user(
            twilio, FIXTURE_PHONE_NUMBER, EMAIL, ob_config_auth, SandboxId(sandbox_id)
        )
        return BifrostClient(ob_config, auth_token, FIXTURE_PHONE_NUMBER, sandbox_id)

    def __init__(
        self,
        ob_config,
        auth_token,
        phone_number,
        sandbox_id,
        override_email=None,
    ):
        self.ob_config = ob_config
        self.auth_token = auth_token
        self.sandbox_id = sandbox_id

        email = override_email or EMAIL
        if sandbox_id:
            # Edit the business name to have the same suffix as the phone number for more visibility
            business_name = f'{BUSINESS_DATA["business.name"]} {sandbox_id}'
        else:
            business_name = BUSINESS_DATA["business.name"]

        self.data = {
            **ID_DATA,
            **BUSINESS_DATA,
            **IP_DATA,
            "document.finra_compliance_letter": multipart_file(
                "example_pdf.pdf", "application/pdf"
            ),
            "document.drivers_license.front.image": multipart_file(
                "drivers_license.front.png", "img/png"
            ),
            "document.drivers_license.back.image": multipart_file(
                "drivers_license.back.png", "img/png"
            ),
            "document.drivers_license.selfie.image": multipart_file(
                "drivers_license.selfie.png", "img/png"
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

        # Initialize the onboarding
        self.initialize_onboarding()

    @property
    def decrypted_data(self):
        return {
            **self.data,
            "id.city": self.data["id.city"].strip(),
            "id.ssn4": self.data["id.ssn9"][-4:],
            "id.email": self.data["id.email"].split("#")[0],
            "id.phone_number": self.data["id.phone_number"]
            .replace(" ", "")
            .split("#")[0],
            "business.phone_number": self.data["business.phone_number"]
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
        body = self.get_status()
        self.already_met_requirements = [
            r for r in body["all_requirements"] if r["is_met"]
        ]
        last_handled_requirement = None
        while True:
            requirements = [r for r in body["all_requirements"] if not r["is_met"]]
            try:
                next_requirement = (
                    next(r for r in requirements)
                    if not kind
                    else next(r for r in requirements if r["kind"] == kind)
                )
            except StopIteration:
                break

            # If the requirement hasn't changed at all since the last iteration, break to prevent
            # infinite loop
            if next_requirement == last_handled_requirement:
                raise RepeatRequirement(next_requirement)

            self.handled_requirements.append(next_requirement)
            self.handle_requirement(next_requirement)
            last_handled_requirement = next_requirement
            body = self.get_status()

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
            self.handle_process()
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
        declarations = self.data["investor_profile.declarations"]
        if doc_required_declarations & set(declarations):
            path = "/hosted/user/upload/document.finra_compliance_letter"
            file = self.data["document.finra_compliance_letter"]
            post(path, None, self.auth_token, files=file)

    def handle_collect_document(self, requirement):
        """Add identity documents to vault"""
        if requirement["should_collect_consent"]:
            consent_data = {"consent_language_text": "I consent"}
            post("hosted/user/consent", consent_data, self.auth_token)

        data = {
            "document_type": "drivers_license",
            "country_code": "US",
        }
        body = post("hosted/user/documents", data, self.auth_token)
        doc_id = body["id"]

        sides = ["front", "back"]
        if requirement["should_collect_selfie"]:
            sides.append("selfie")

        # Upload the documents consecutively in separate requests
        for i, side in enumerate(sides):
            file = self.data[f"document.drivers_license.{side}.image"]
            headers = {
                "x-fp-is-app-clip": "true",
                "x-fp-is-instant-app": "false",
                "x-fp-is-mobile": "true",
                "x-fp-process-separately": "true",
            }
            post(
                f"hosted/user/documents/{doc_id}/upload/{side}",
                None,
                self.auth_token,
                files=file,
                addl_headers=headers,
            )
            body = post(
                f"hosted/user/documents/{doc_id}/process", None, self.auth_token
            )
            next_side = sides[i + 1] if i + 1 < len(sides) else None
            assert body["next_side_to_collect"] == next_side
            assert not body["errors"]

        # Also upload the barcodes
        data = {
            "document.drivers_license.back.barcodes": [
                dict(
                    kind="pdf417",
                    content="@ANSI 6360050101DL00300201DLDAQ102245737DAASAMPLE,DRIVER,CREDENTIAL,DAG 1500 PARK STDAICOLUMBIADAJSCDAK292012731 DARD DAS DAT DAU600DAW200DAY DAZ DBA20190928DBB19780928DBC1DBD20091026DBG2DBH1",
                )
            ]
        }
        patch("hosted/user/vault", data, self.auth_token)

    def handle_liveness(self):
        """Register the passkey credential"""
        body = post("hosted/user/passkey/register", None, self.auth_token)
        chal_token = body["challenge_token"]
        chal = override_webauthn_challenge(json.loads(body["challenge_json"]))
        attestation = self.webauthn_device.create(chal, TEST_URL)
        attestation = override_webauthn_attestation(attestation)
        data = dict(
            challenge_token=chal_token, device_response_json=json.dumps(attestation)
        )
        post("hosted/user/passkey", data, self.auth_token)

    def handle_authorize(self, **kwargs):
        post("hosted/onboarding/authorize", None, self.auth_token, **kwargs)

    def handle_process(self, **kwargs):
        # Extract the fixture result from the sandbox_id
        if self.sandbox_id is None:
            fixture_result = None
        elif self.sandbox_id.startswith("fail"):
            fixture_result = "fail"
        elif self.sandbox_id.startswith("manualreview"):
            fixture_result = "manual_review"
        elif self.sandbox_id.startswith("stepup"):
            fixture_result = "step_up"
        else:
            fixture_result = "pass"
        body = dict(fixture_result=fixture_result) if fixture_result else None
        post("hosted/onboarding/process", body, self.auth_token, **kwargs)

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


class RepeatRequirement(Exception):
    def __init__(self, requirement):
        self.requirement = requirement
        super().__init__()
