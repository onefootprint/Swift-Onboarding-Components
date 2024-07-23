from tests.utils import post, get
from tests.constants import (
    FIXTURE_PHONE_NUMBER,
    FIXTURE_EMAIL,
    FIXTURE_OTP_PIN,
    TEST_URL,
)
from tests.headers import FpAuth, SandboxId


class IdentifyClient:
    def from_user(user, **kwargs):
        """
        Initiate the IdentifyClient from a user created via BifrostClient, with optional kwarg
        overrides.
        """
        return IdentifyClient(
            playbook=kwargs.pop("playbook", user.client.ob_config),
            sandbox_id=kwargs.pop("sandbox_id", user.client.sandbox_id),
            webauthn=kwargs.pop("webauthn", user.client.webauthn_device),
            phone_number=kwargs.pop(
                "phone_number", user.client.data["id.phone_number"]
            ),
            email=kwargs.pop("email", user.client.data["id.email"]),
            **kwargs,
        )

    def from_token(auth_token, **kwargs):
        return IdentifyClient(
            playbook=None, sandbox_id=None, auth_token=auth_token, **kwargs
        )

    def __init__(
        self,
        playbook,
        sandbox_id,
        webauthn=None,
        phone_number=FIXTURE_PHONE_NUMBER,
        email=FIXTURE_EMAIL,
        auth_token=None,
        # Only used for BO auth
        override_playbook_auth=None,
    ):
        self.playbook = playbook
        self.playbook_auth_h = override_playbook_auth or getattr(playbook, "key", None)
        self.sandbox_id = sandbox_id

        self.webauthn = webauthn
        self.phone_number = phone_number
        self.email = email
        self.auth_token = auth_token
        self.headers = []

    def with_headers(self, *args):
        self.headers = args
        return self

    def _signup_challenge(self, scope, kind="sms"):
        if kind == "sms":
            data = dict(
                phone_number=dict(value=self.phone_number),
                email=dict(value=self.email),
            )
        elif kind == "email":
            data = dict(email=dict(value=self.email))
        data = dict(**data, scope=scope)

        assert (
            self.playbook_auth_h
        ), "Cannot issue signup challenge without playbook auth"
        headers = [*self.headers, self.playbook_auth_h]
        if self.sandbox_id:
            headers.append(SandboxId(self.sandbox_id))
        body = post("hosted/identify/signup_challenge", data, *headers)
        self.challenge_kind = kind
        self.challenge_data = body["challenge_data"]

    def _login_challenge(self, kind, scope):
        data = dict(scope=scope)
        if not self.auth_token:
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
        if self.auth_token:
            headers.append(self.auth_token)
        body = post("hosted/identify", data, *headers)
        assert body["user"]
        assert kind in body["user"]["available_challenge_kinds"]
        token = FpAuth(body["user"]["token"])

        # Issue the login challenge
        data = dict(
            preferred_challenge_kind=kind,
            scope=scope,
        )
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
        self._signup_challenge(scope)
        return self._verify(scope)

    def inherit(self, kind="sms", scope="onboarding"):
        self._login_challenge(kind, scope)
        return self._verify(scope)

    def step_up(self, kind="sms", scope="onboarding", assert_had_no_scopes=False):
        """
        Just a wrapper around inherit, including some assertions that the new token has additional
        scopes
        """
        assert self.auth_token, "Can only step up if had existing token"

        # Token should start with no scopes
        body = get("hosted/user/token", None, self.auth_token)
        original_scopes = body["scopes"]
        if assert_had_no_scopes:
            assert not body[
                "scopes"
            ], "Token expected to be only identified and have no scopes"

        # Perform the step up
        new_token = self.inherit(kind=kind, scope=scope)

        # Now, new token should have scopes
        if scope == "onboarding":
            expected_scope = "sign_up"
        elif scope == "auth":
            expected_scope = "auth"
        elif scope == "my1fp":
            expected_scope = "basic_profile"
        body = get("hosted/user/token", None, new_token)
        new_scopes = body["scopes"]
        assert set(new_scopes) >= {expected_scope}
        assert (
            new_token.value != self.auth_token.value
        ), "Verify should give us a new token with permissions"
        assert set(new_scopes) > set(
            original_scopes
        ), "Stepped up token should have additional scopes"

        # And scopes of old token shouldn't have changed
        body = get("hosted/user/token", None, self.auth_token)
        assert set(body["scopes"]) == set(
            original_scopes
        ), "Original token scopes shouldn't have changed"

        return new_token


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
