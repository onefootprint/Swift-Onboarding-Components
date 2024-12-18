from tests.types import ObConfiguration
from tests.utils import post, get
from tests.constants import (
    FIXTURE_PHONE_NUMBER,
    FIXTURE_EMAIL,
    FIXTURE_OTP_PIN,
    TEST_URL,
)
from tests.headers import FpAuth, SandboxId


class IdentifyClient:
    @classmethod
    def from_user(cls, user, **kwargs):
        """
        Initiate the IdentifyClient from a user created via BifrostClient, with optional kwarg
        overrides.
        """
        return cls(
            playbook=kwargs.pop("playbook", user.client.ob_config),
            sandbox_id=kwargs.pop("sandbox_id", user.client.sandbox_id),
            webauthn=kwargs.pop("webauthn", user.client.webauthn_device),
            phone_number=kwargs.pop(
                "phone_number", user.client.data["id.phone_number"]
            ),
            email=kwargs.pop("email", user.client.data["id.email"]),
            **kwargs,
        )

    @classmethod
    def from_token(cls, auth_token, expected_scopes=set(), **kwargs):
        """
        Initialize the IdentifyClient such that the identified user is the one
        associated with the given auth token.
        """

        body = get("hosted/user/token", None, auth_token)
        original_scopes = body["scopes"]
        assert (
            set(original_scopes) == expected_scopes
        ), "Token has different scopes than expected"

        return IdentifyClient(
            playbook=None,
            sandbox_id=None,
            phone_number=None,
            email=None,
            _auth_token=auth_token,
            _auth_token_scopes=original_scopes,
            **kwargs,
        )

    def __init__(
        self,
        playbook: ObConfiguration,
        sandbox_id,
        webauthn=None,
        phone_number=FIXTURE_PHONE_NUMBER,
        email=FIXTURE_EMAIL,
        # Only used for BO auth
        override_playbook_auth=None,
        # For internal use by other construtors.
        _auth_token=None,
        _auth_token_scopes=None,
    ):
        self.playbook = playbook
        self.playbook_auth_h = override_playbook_auth or getattr(playbook, "key", None)
        self.sandbox_id = sandbox_id

        self.webauthn = webauthn
        self.phone_number = phone_number
        self.email = email
        # Auth token used for identifying the user.
        # Distinct from the auth token returned by login().
        self._auth_token = _auth_token
        self._auth_token_scopes = _auth_token_scopes

        self.headers = []

        if self._auth_token and (self.phone_number or self.email):
            raise Exception(
                "Ambiguous initialization of IdentifyClient: choose a) auth_token or b) phone_number/email to identify a user"
            )

    def with_headers(self, *args):
        self.headers = args
        return self

    def _login_challenge(self, kind, scope):
        data = dict(scope=scope)
        if not self._auth_token:
            if kind == "email":
                data["email"] = self.email
            else:
                data["phone_number"] = self.phone_number

        # Check that the user is found in identify
        headers = [*self.headers]
        if self.sandbox_id:
            headers.append(SandboxId(self.sandbox_id))
        if self.playbook_auth_h:
            headers.append(self.playbook_auth_h)
        if self._auth_token:
            headers.append(self._auth_token)
        body = post("hosted/identify", data, *headers)
        assert body["user"]
        assert kind in body["user"]["available_challenge_kinds"]
        token = FpAuth(body["user"]["token"])

        # Issue the login challenge
        data = dict(preferred_challenge_kind=kind, scope=scope)
        body = post("hosted/identify/login_challenge", data, token)
        assert body["challenge_data"]["challenge_kind"] == kind
        self.challenge_kind = kind
        self.challenge_data = body["challenge_data"]

    def _verify(self, scope):
        assert self.challenge_data, "Must initiate a signup or login challenge first"

        if self.challenge_kind == "sms":
            challenge_response = FIXTURE_OTP_PIN
        elif self.challenge_kind == "email":
            challenge_response = FIXTURE_OTP_PIN
        elif self.challenge_kind == "biometric":
            challenge_response = biometric_challenge_response(
                self.challenge_data, self.webauthn
            )

        data = {
            "challenge_response": challenge_response,
            "challenge_token": self.challenge_data["challenge_token"],
            "scope": scope,
        }
        token = FpAuth(self.challenge_data["token"])
        body = post("hosted/identify/verify", data, token)
        auth_token = FpAuth(body["auth_token"])

        # Reset the challenge state so the machine can be used again
        self.challenge_kind = None
        self.challenge_data = None

        return auth_token

    def create_user(self, scope="onboarding"):
        data = {
            "id.phone_number": self.phone_number,
            "id.email": self.email,
        }
        if self.playbook.is_no_phone_flow:
            data.pop("id.phone_number")
        assert (
            self.playbook_auth_h
        ), "Cannot issue signup challenge without playbook auth"
        headers = [*self.headers, self.playbook_auth_h]
        if self.sandbox_id:
            headers.append(SandboxId(self.sandbox_id))

        # Create the session with vault data and sandbox ID provided
        data = dict(data=data, scope=scope)
        body = post("hosted/identify/session", data, *headers)
        token = FpAuth(body["token"])

        # Make sure the challenge kind is in the requirements
        body = get("hosted/identify/session/requirements", None, token)
        assert all(i["kind"] == "challenge" for i in body["requirements"])

        for req in body["requirements"]:
            # Run every challenge requirement
            kind = next(i for i in req["challenge_kinds"] if i != "sms_link")
            data = dict(challenge_kind=kind)
            body = post("hosted/identify/session/challenge", data, token)
            challenge_token = body["challenge_data"]["challenge_token"]
            data = dict(challenge_token=challenge_token, challenge_response="000000")
            post("hosted/identify/session/challenge/verify", data, token)

        # Verify the identify session
        body = post("hosted/identify/session/verify", None, token)
        return FpAuth(body["auth_token"])

    def login(self, kind="sms", scope="onboarding"):
        self._login_challenge(kind, scope)
        new_auth_token = self._verify(scope)

        if self._auth_token:
            self._validate_login_token(new_auth_token, kind, scope)

        return new_auth_token

    def _validate_login_token(self, token, kind, scope):
        # Now, new token should have scopes
        if scope == "onboarding":
            expected_scope = "sign_up"
        elif scope == "auth":
            expected_scope = "auth"
        elif scope == "my1fp":
            expected_scope = "basic_profile"
        body = get("hosted/user/token", None, token)
        new_scopes = body["scopes"]
        assert set(new_scopes) >= {expected_scope}
        assert (
            token.value != self._auth_token.value
        ), "Verify should give us a new token with permissions"

        assert set(new_scopes) >= set(
            self._auth_token_scopes
        ), "New token should have at least the same scopes as the old token"

        # And scopes of old token shouldn't have changed
        body = get("hosted/user/token", None, self._auth_token)
        assert set(body["scopes"]) == set(
            self._auth_token_scopes
        ), "Original token scopes shouldn't have changed"

        return token


def biometric_challenge_response(challenge_data, webauthn):
    import json
    from tests.utils import _b64_decode, _b64_encode

    # do webauthn
    chal = json.loads(challenge_data["biometric_challenge_json"])
    chal["publicKey"]["challenge"] = _b64_decode(chal["publicKey"]["challenge"])

    attestation = webauthn.get(chal, TEST_URL)
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

    return json.dumps(attestation)
