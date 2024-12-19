package com.onefootprint.native_onboarding_components

import com.onefootprint.native_onboarding_components.models.FootprintException
import com.onefootprint.native_onboarding_components.models.HttpError
import io.ktor.client.HttpClientConfig
import io.ktor.client.call.body
import org.openapitools.client.apis.IdentifyApi
import org.openapitools.client.apis.OnboardingApi
import org.openapitools.client.apis.SdkArgsApi
import org.openapitools.client.apis.UserApi
import org.openapitools.client.apis.VaultApi
import org.openapitools.client.models.ChallengeKind
import org.openapitools.client.models.CreateUserTokenRequest
import org.openapitools.client.models.CreateUserTokenResponse
import org.openapitools.client.models.DataIdentifier
import org.openapitools.client.models.HostedUserDecryptRequest
import org.openapitools.client.models.HostedValidateResponse
import org.openapitools.client.models.IdentifyChallengeResponse
import org.openapitools.client.models.IdentifyRequest
import org.openapitools.client.models.IdentifyResponse
import org.openapitools.client.models.IdentifyScope
import org.openapitools.client.models.IdentifyVerifyRequest
import org.openapitools.client.models.IdentifyVerifyResponse
import org.openapitools.client.models.LogBody
import org.openapitools.client.models.LoginChallengeRequest
import org.openapitools.client.models.ModernRawUserDataRequest
import org.openapitools.client.models.ModernUserDecryptResponse
import org.openapitools.client.models.OnboardingResponse
import org.openapitools.client.models.OnboardingStatusResponse
import org.openapitools.client.models.PostOnboardingRequest
import org.openapitools.client.models.ProcessRequest
import org.openapitools.client.models.PublicOnboardingConfiguration
import org.openapitools.client.models.RequestedTokenScope
import org.openapitools.client.models.SdkArgs
import org.openapitools.client.models.SignupChallengeRequest
import org.openapitools.client.models.SignupChallengeRequestEmail
import org.openapitools.client.models.WorkflowFixtureResult

internal object FootprintQueries {
    private var onboardingApi: OnboardingApi = OnboardingApi()
    private var identifyApi: IdentifyApi = IdentifyApi()
    private var userApi: UserApi = UserApi()
    private var vaultApi: VaultApi = VaultApi()
    private var sdkArgsApi: SdkArgsApi = SdkArgsApi()

    fun initialize(httpClientConfig: ((HttpClientConfig<*>) -> Unit)) {
        this.onboardingApi = OnboardingApi(httpClientConfig = httpClientConfig)
        this.identifyApi = IdentifyApi(httpClientConfig = httpClientConfig)
        this.userApi = UserApi(httpClientConfig = httpClientConfig)
        this.vaultApi = VaultApi(httpClientConfig = httpClientConfig)
        this.sdkArgsApi = SdkArgsApi(httpClientConfig = httpClientConfig)
    }

    suspend fun getOnboardingConfig(
        publicKey: String?,
        authToken: String?
    ): PublicOnboardingConfiguration {

        val response =
            this.onboardingApi.hostedOnboardingConfigGet(
                xOnboardingConfigKey = publicKey,
                xFpAuthorization = authToken
            )
        if (!response.success) {
            val error = response.response.body<HttpError>()
            val errorCode = error.code
            val supportId = error.supportId

            throw FootprintException(
                kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                message = when (errorCode) {
                    "E127" -> "Make sure that the public key matches the associated public key of the auth token"
                    else -> "Make sure that you provided a valid public key or auth token"
                },
                supportId = supportId
            )

        }
        return response.body()
    }


    suspend fun identify(
        phoneNumber: String? = null,
        email: String? = null,
        authToken: String? = null,
        publicKey: String? = null,
        sandboxId: String? = null,
        scope: IdentifyScope
    ): IdentifyResponse {
        val response = identifyApi.hostedIdentifyPost(
            identifyRequest = IdentifyRequest(
                email = email, phoneNumber = phoneNumber, scope = scope
            ),
            xSandboxId = sandboxId,
            xFpAuthorization = authToken,
            xOnboardingConfigKey = publicKey
        )
        if (!response.success) {
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = error.message,
                supportId = error.supportId
            )
        }
        return response.body()
    }

    suspend fun createSignUpChallenge(
        email: String?,
        phoneNumber: String?,
        kind: ChallengeKind,
        sandboxId: String?,
        scope: IdentifyScope,
        publicKey: String?
    ): IdentifyChallengeResponse {
        val response = identifyApi.hostedIdentifySignupChallengePost(
            signupChallengeRequest = SignupChallengeRequest(
                challengeKind = kind,
                scope = scope,
                email = if (email != null) SignupChallengeRequestEmail(
                    isBootstrap = false,
                    value = email
                ) else null,
                phoneNumber = if (phoneNumber != null) SignupChallengeRequestEmail(
                    isBootstrap = false,
                    value = phoneNumber
                ) else null
            ),
            xSandboxId = sandboxId,
            xOnboardingConfigKey = publicKey,
            xFpIsComponentsSdk = true
        )

        if (!response.success) {
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = error.message,
                supportId = error.supportId
            )
        }

        return response.body()
    }

    suspend fun createLoginChallenge(
        authToken: String?,
        kind: ChallengeKind
    ): IdentifyChallengeResponse {
        val response = identifyApi.hostedIdentifyLoginChallengePost(
            loginChallengeRequest = LoginChallengeRequest(
                challengeKind = kind
            ),
            xFpAuthorization = authToken
        )

        if (!response.success) {
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = error.message,
                supportId = error.supportId
            )
        }

        return response.body()
    }

    suspend fun verifyChallenge(
        challengeResponse: String,
        challengeToken: String,
        challengeAuthToken: String,
        scope: IdentifyScope
    ): IdentifyVerifyResponse {
        val response = identifyApi.hostedIdentifyVerifyPost(
            identifyVerifyRequest = IdentifyVerifyRequest(
                challengeResponse = challengeResponse,
                challengeToken = challengeToken,
                scope = scope
            ),
            xFpAuthorization = challengeAuthToken
        )

        if (!response.success) {
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = error.message,
                supportId = error.supportId
            )
        }

        return response.body()
    }

    suspend fun validateOnboarding(authToken: String): HostedValidateResponse {
        val response = onboardingApi.hostedOnboardingValidatePost(
            xFpAuthorization = authToken
        )

        if (!response.success) {
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.ONBOARDING_ERROR,
                message = error.message,
                supportId = error.supportId
            )
        }

        return response.body()
    }

    suspend fun getValidationToken(authToken: String): HostedValidateResponse {
        val response = userApi.hostedIdentifyValidationTokenPost(
            xFpAuthorization = authToken
        )

        if (!response.success) {
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.USER_ERROR,
                message = error.message,
                supportId = error.supportId
            )
        }

        return response.body()
    }

    suspend fun initOnboarding(
        authToken: String,
        overallOutcome: WorkflowFixtureResult?
    ): OnboardingResponse {
        val response = onboardingApi.hostedOnboardingPost(
            postOnboardingRequest = PostOnboardingRequest(
                fixtureResult = overallOutcome
            ),
            xFpAuthorization = authToken
        )

        if (!response.success) {
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.ONBOARDING_ERROR,
                message = error.message,
                supportId = error.supportId
            )
        }

        return response.body()
    }

    suspend fun createVaultingToken(authToken: String): CreateUserTokenResponse {
        val response = userApi.hostedUserTokensPost(
            createUserTokenRequest = CreateUserTokenRequest(
                requestedScope = RequestedTokenScope.onboarding
            ),
            xFpAuthorization = authToken
        )

        if (!response.success) {
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.USER_ERROR,
                message = error.message,
                supportId = error.supportId
            )
        }

        return response.body()
    }

    suspend fun getOnboardingStatus(authToken: String): OnboardingStatusResponse {
        val response = onboardingApi.hostedOnboardingStatusGet(xFpAuthorization = authToken)
        if (!response.success) {
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.ONBOARDING_ERROR,
                message = error.message,
                supportId = error.supportId
            )
        }

        return response.body()
    }

    suspend fun vault(authToken: String, vaultData: ModernRawUserDataRequest): String {
        val response = vaultApi.hostedUserVaultPatch(
            modernRawUserDataRequest = vaultData,
            xFpAuthorization = authToken
        )
        if (!response.success) {
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.VAULTING_ERROR,
                message = error.message,
                supportId = error.supportId,
                context = error.context
            )
        }

        return response.body()
    }

    suspend fun decrypt(
        authToken: String,
        fields: List<DataIdentifier>
    ): ModernUserDecryptResponse {
        val filteredFields = fields.filter {
            it != DataIdentifier.idSsn9 &&
                    it != DataIdentifier.idSsn4 &&
                    it != DataIdentifier.idUsTaxId &&
                    !it.value.startsWith("document.")
        }

        val response = vaultApi.hostedUserVaultDecryptPost(
            hostedUserDecryptRequest = HostedUserDecryptRequest(fields = filteredFields),
            xFpAuthorization = authToken
        )

        if (!response.success) {
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.DECRYPTION_ERROR,
                message = error.message,
                supportId = error.supportId
            )
        }

        return response.body()
    }

    suspend fun process(authToken: String, overallOutcome: WorkflowFixtureResult? = null) {
        val response = onboardingApi.hostedOnboardingProcessPost(
            xFpAuthorization = authToken,
            processRequest = ProcessRequest(
                fixtureResult = overallOutcome
            )
        )

        if (!response.success) {
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.ONBOARDING_ERROR,
                message = error.message,
                supportId = error.supportId
            )
        }
    }

    suspend fun createSDKArgs(sdkArgs: SdkArgs): String {
        val response = this.sdkArgsApi.orgSdkArgsPost(sdkArgs = sdkArgs)

        if (!response.success) {
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.SDK_ERROR,
                message = error.message,
                supportId = error.supportId
            )
        }

        return response.body().token
    }

    suspend fun sendTelemetry(logBody: LogBody) {
        val response = this.sdkArgsApi.orgSdkTelemetryPost(logBody = logBody)

        if (!response.success) {
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.SDK_ERROR,
                message = error.message,
                supportId = error.supportId
            )
        }
    }
}