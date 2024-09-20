class BaseAuth:
    HEADER_NAME: str = None

    def __init__(self, value):
        self.value = value
        assert self.HEADER_NAME, "Auth class doesn't have HEADER_NAME set"


class FpAuth(BaseAuth):
    HEADER_NAME = "x-fp-authorization"


class SdkArgs(BaseAuth):
    HEADER_NAME = "x-fp-sdk-args-token"


class PlaybookKey(BaseAuth):
    HEADER_NAME = "X-Onboarding-Config-Key"


class BusinessOwnerAuth(BaseAuth):
    HEADER_NAME = "X-Kyb-Bo-Token"


class OnboardingSessionToken(BaseAuth):
    HEADER_NAME = "X-Onboarding-Session-Token"


class TenantSecretAuth(BaseAuth):
    HEADER_NAME = "X-Footprint-Secret-Key"


class CustodianAuth(BaseAuth):
    HEADER_NAME = "x-footprint-custodian-key"


class DashboardAuth(BaseAuth):
    HEADER_NAME = "x-fp-dashboard-authorization"


class SecondaryDashboardAuth(BaseAuth):
    HEADER_NAME = "x-fp-dashboard-authorization-secondary"


class ClientTokenAuth(BaseAuth):
    HEADER_NAME = "x-fp-authorization"


class IgnoreCardValidation(BaseAuth):
    HEADER_NAME = "x-fp-ignore-luhn-validation"


class IsLive(BaseAuth):
    """
    Allows specifying whether a request made with the DashboardAuth should be for live or sandbox data
    """

    HEADER_NAME = "x-is-live"


class IdempotencyId(BaseAuth):
    HEADER_NAME = "x-idempotency-id"


class ExternalId(BaseAuth):
    HEADER_NAME = "x-external-id"


class SandboxId(BaseAuth):
    HEADER_NAME = "x-sandbox-id"

    def __init__(self, value):
        # Don't send the fixture result in sandbox ID anymore so it is required to be sent in POST /process
        if "fail" in value or "manualreview" in value or "stepup" in value:
            assert False, "Legacy sandbox ID"
        super().__init__(value)


class IsComponentsSdk(BaseAuth):
    HEADER_NAME = "x-fp-is-components-sdk"


class BootstrappedFields(BaseAuth):
    HEADER_NAME = "x-fp-bootstrapped-fields"


class SessionId(BaseAuth):
    HEADER_NAME = "x-fp-session-id"


class VaultVersion(BaseAuth):
    HEADER_NAME = "x-fp-vault-version"

    def __init__(self, value):
        super().__init__(str(value))
