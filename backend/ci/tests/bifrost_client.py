import json
from typing import NamedTuple, Optional
from tests.types import Tenant
from tests.constants import (
    TEST_URL,
    ID_DATA,
    BUSINESS_DATA,
    IP_DATA,
    CDO_TO_DIS,
    FIXTURE_PHONE_NUMBER,
    FIXTURE_EMAIL,
)
from tests.webauthn_simulator import SoftWebauthnDevice
from tests.identify_client import IdentifyClient
from tests.utils import (
    _gen_random_sandbox_id,
    open_multipart_file,
    _gen_random_ssn,
    get,
    post,
    patch,
    override_webauthn_challenge,
    override_webauthn_attestation,
    get_requirement_from_requirements,
)


class BifrostClient:
    """
    BifrostClient simulates Footprint hosted frontend's requests to the backend APIs.
    By default, the BifrostClient is created with a user that has the FIXTURE_PHONE_NUMBER and
    FIXTURE_EMAIl
    """

    def raw_auth(ob_config, auth_token, sandbox_id, **kwargs):
        """
        Create an instance of BifrostClient that uses the provided auth token, skipping the identify flow in
        favor of the provided auth.
        """
        return BifrostClient(ob_config, auth_token, sandbox_id, **kwargs)

    def inherit_user(ob_config, sandbox_id, override_ob_config_auth=None, **kwargs):
        """
        Create an instance of BifrostClient that inherits the user with the provided phone number.
        """
        auth = IdentifyClient(
            ob_config, sandbox_id, override_playbook_auth=override_ob_config_auth
        ).inherit()
        return BifrostClient(ob_config, auth, sandbox_id, **kwargs)

    def new_user(
        ob_config, override_sandbox_id=None, override_ob_config_auth=None, **kwargs
    ):
        """
        Create an instance of BifrostClient that creates a new sandbox user with the fixture phone number
        """
        sandbox_id = override_sandbox_id or _gen_random_sandbox_id()
        auth_token = IdentifyClient(
            ob_config, sandbox_id, override_playbook_auth=override_ob_config_auth
        ).create_user()
        return BifrostClient(ob_config, auth_token, sandbox_id, **kwargs)

    def __init__(
        self,
        ob_config,
        auth_token,
        sandbox_id,
        override_phone=None,
        override_email=None,
        provide_playbook_auth=False,
        fixture_result=None,
        kyb_fixture_result=None,
    ):
        self.ob_config = ob_config
        self.auth_token = auth_token
        self.sandbox_id = sandbox_id

        if sandbox_id is None:
            self.fixture_result = None
            self.kyb_fixture_result = None
        else:
            self.fixture_result = fixture_result or "pass"
            self.kyb_fixture_result = kyb_fixture_result or fixture_result

        phone_number = override_phone or FIXTURE_PHONE_NUMBER
        email = override_email or FIXTURE_EMAIL
        if sandbox_id:
            # Edit the business name to have the same suffix as the phone number for more visibility
            business_name = f'{BUSINESS_DATA["business.name"]} {sandbox_id}'
        else:
            business_name = BUSINESS_DATA["business.name"]

        ssn9 = _gen_random_ssn()
        self.data = {
            **ID_DATA,
            **BUSINESS_DATA,
            **IP_DATA,
            "document.finra_compliance_letter": open_multipart_file(
                "example_pdf.pdf", "application/pdf"
            ),
            "document.drivers_license.front.image": open_multipart_file(
                "drivers_license.front.png", "image/png"
            ),
            "document.drivers_license.back.image": open_multipart_file(
                "drivers_license.back.png", "image/png"
            ),
            "document.drivers_license.selfie.image": open_multipart_file(
                "drivers_license.selfie.png", "image/png"
            ),
            "id.ssn9": ssn9,
            "id.ssn4": ssn9[-4:],
            "business.name": business_name,
            "id.phone_number": phone_number,
            "id.email": email,
        }
        self.vault_barcode_with_doc = True

        # After running bifrost, this will be the list of requirements satisfied
        self.handled_requirements = []

        # Keep track of biometric credentials created
        self.webauthn_device = SoftWebauthnDevice()

        # Check the validation token
        body = post("hosted/identify/validation_token", None, auth_token)
        validation_token = body["validation_token"]

        data = dict(validation_token=validation_token)
        body = post("onboarding/session/validate", data, ob_config.tenant.sk.key)

        # Shouldn't have any user or business associated
        assert not body.get("business")
        assert not body.get("user")
        # Check user_auth
        assert body["user_auth"]["fp_id"]
        assert all(
            e["kind"] in {"sms", "email", "passkey", "third_party"}
            for e in body["user_auth"]["auth_events"]
        )
        assert all(e["timestamp"] for e in body["user_auth"]["auth_events"])

        # Initialize the onboarding
        self.initialize_onboarding(provide_playbook_auth)

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

    def initialize_onboarding(self, provide_playbook_auth):
        auths = [self.auth_token]
        if provide_playbook_auth:
            auths.append(self.ob_config.key)
        body = dict(
            fixture_result=self.fixture_result,
            kyb_fixture_result=self.kyb_fixture_result,
        )
        if not self.fixture_result:
            # For backwards compatibility
            body = None
        return post("hosted/onboarding", body, *auths)

    def get_status(self):
        return get("hosted/onboarding/status", None, self.auth_token)

    def get_requirement(self, kind):
        status = self.get_status()
        return get_requirement_from_requirements(kind, status["all_requirements"])

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
        elif requirement["kind"] == "register_auth_method":
            self.handle_register_auth_method(requirement)
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
            di
            for cdo in requirement["missing_attributes"]
            + requirement.get("optional_attributes", [])
            for di in CDO_TO_DIS[cdo]
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
            file = self.data["document.finra_compliance_letter"]()
            post(path, None, self.auth_token, files=file)

    def handle_collect_document(self, requirement):
        """Add identity documents to vault"""
        if requirement["config"].get("should_collect_consent", None):
            consent_data = {"consent_language_text": "I consent"}
            post("hosted/user/consent", consent_data, self.auth_token)

        doc_kind = None
        country_code = None
        sides = ["front"]
        if requirement["config"]["kind"] == "identity":
            us_docs = requirement["config"]["supported_country_and_doc_types"].get("US")
            mx_docs = requirement["config"]["supported_country_and_doc_types"].get("MX")
            supported_doc_types = us_docs if us_docs is not None else []
            supported_doc_types_mx = mx_docs if mx_docs is not None else []

            if "drivers_license" in supported_doc_types:
                doc_kind = "drivers_license"
                country_code = "US"
                sides.append("back")
            elif "voter_identification" in supported_doc_types_mx:
                # Kind of a hack
                doc_kind = "voter_identification"
                country_code = "MX"
                sides.append("back")

            if requirement["config"]["should_collect_selfie"]:
                sides.append("selfie")
        elif requirement["config"]["kind"] == "proof_of_ssn":
            doc_kind = "ssn_card"
        elif requirement["config"]["kind"] == "proof_of_address":
            # Kind of a hack - we won't actually upload a PoA image
            doc_kind = "proof_of_address"
        elif requirement["config"]["kind"] == "custom":
            doc_kind = "custom"
        else:
            assert False, "BifrostClient can't handle this document requirement"

        data = {
            "request_id": requirement["document_request_id"],
            "document_type": doc_kind,
            "country_code": country_code,
        }
        body = post("hosted/documents", data, self.auth_token)
        doc_id = body["id"]

        # Upload the documents consecutively in separate requests
        for i, side in enumerate(sides):
            file = self.data[f"document.drivers_license.{side}.image"]()
            headers = {
                "x-fp-is-app-clip": "true",
                "x-fp-is-instant-app": "false",
                "x-fp-is-mobile": "true",
            }
            post(
                f"hosted/documents/{doc_id}/upload/{side}",
                None,
                self.auth_token,
                files=file,
                addl_headers=headers,
            )
            body = post(f"hosted/documents/{doc_id}/process", None, self.auth_token)
            next_side = sides[i + 1] if i + 1 < len(sides) else None
            assert body["next_side_to_collect"] == next_side
            assert not body["errors"]

        # Also upload the barcodes
        if self.vault_barcode_with_doc:
            data = {
                "document.drivers_license.back.barcodes": [
                    dict(
                        kind="pdf417",
                        content="@ANSI 6360050101DL00300201DLDAQ102245737DAASAMPLE,DRIVER,CREDENTIAL,DAG 1500 PARK STDAICOLUMBIADAJSCDAK292012731 DARD DAS DAT DAU600DAW200DAY DAZ DBA20190928DBB19780928DBC1DBD20091026DBG2DBH1",
                    )
                ]
            }
            patch("hosted/user/vault", data, self.auth_token)

    def handle_register_auth_method(self, requirement):
        CHALLENGE_INFO = {
            "phone": dict(kind="sms", phone_number=self.data["id.phone_number"]),
            "email": dict(kind="email", email=self.data["id.email"]),
        }
        challenge_info = CHALLENGE_INFO[requirement["auth_method_kind"]]

        data = dict(**challenge_info, action_kind="add_primary")
        body = post("hosted/user/challenge", data, self.auth_token)
        chal_token = body["challenge_token"]
        data = dict(challenge_token=chal_token, challenge_response="000000")
        post("hosted/user/challenge/verify", data, self.auth_token)

    def handle_liveness(self):
        """Register the passkey credential"""
        data = dict(kind="passkey", action_kind="add_primary")
        body = post("hosted/user/challenge", data, self.auth_token)
        chal_token = body["challenge_token"]
        chal = override_webauthn_challenge(json.loads(body["biometric_challenge_json"]))
        attestation = self.webauthn_device.create(chal, TEST_URL)
        attestation = override_webauthn_attestation(attestation)
        data = dict(
            challenge_token=chal_token, challenge_response=json.dumps(attestation)
        )
        post("hosted/user/challenge/verify", data, self.auth_token)

    def handle_authorize(self, **kwargs):
        post("hosted/onboarding/authorize", None, self.auth_token, **kwargs)

    def handle_process(self, **kwargs):
        post("hosted/onboarding/process", None, self.auth_token, **kwargs)

    def validate(self, **kwargs):
        return post("hosted/onboarding/validate", None, self.auth_token, **kwargs)

    def validate_token(self, validation_token):
        # Use the SK of the tenant that owns the ob config, corresponding to the OBC's is_live
        data = dict(validation_token=validation_token)
        if self.ob_config.is_live:
            key = self.ob_config.tenant.l_sk
        else:
            key = self.ob_config.tenant.s_sk
        body = post("onboarding/session/validate", data, key)

        # Check user
        assert body["user"]["fp_id"]
        assert body["user"]["requires_manual_review"] is not None
        assert body["user"]["status"] in {"pass", "fail", "pending", "none"}
        assert body["user"]["playbook_key"] == self.ob_config.key.value
        # Check user_auth
        assert body["user_auth"]["fp_id"] == body["user"]["fp_id"]
        assert all(
            e["kind"] in {"sms", "email", "passkey"}
            for e in body["user_auth"]["auth_events"]
        )
        assert all(e["timestamp"] for e in body["user_auth"]["auth_events"])

        if body.get("business", None):
            assert body["business"]["playbook_key"] == self.ob_config.key.value

        self.validate_response = body
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
        super().__init__(requirement)
