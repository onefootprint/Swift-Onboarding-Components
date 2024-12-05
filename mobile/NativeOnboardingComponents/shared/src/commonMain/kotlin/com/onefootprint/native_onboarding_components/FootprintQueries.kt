package com.onefootprint.native_onboarding_components

import com.onefootprint.native_onboarding_components.models.FootprintException
import com.onefootprint.native_onboarding_components.models.HttpError
import com.onefootprint.native_onboarding_components.models.OverallOutcome
import io.ktor.client.call.body
import org.openapitools.client.apis.IdentifyApi
import org.openapitools.client.apis.OnboardingApi
import org.openapitools.client.apis.UserApi
import org.openapitools.client.models.ChallengeKind
import org.openapitools.client.models.CreateUserTokenRequest
import org.openapitools.client.models.CreateUserTokenResponse
import org.openapitools.client.models.HostedValidateResponse
import org.openapitools.client.models.IdentifyChallengeResponse
import org.openapitools.client.models.IdentifyRequest
import org.openapitools.client.models.IdentifyResponse
import org.openapitools.client.models.IdentifyScope
import org.openapitools.client.models.IdentifyVerifyRequest
import org.openapitools.client.models.IdentifyVerifyResponse
import org.openapitools.client.models.LoginChallengeRequest
import org.openapitools.client.models.OnboardingResponse
import org.openapitools.client.models.OnboardingStatusResponse
import org.openapitools.client.models.PostOnboardingRequest
import org.openapitools.client.models.PublicOnboardingConfiguration
import org.openapitools.client.models.RequestedTokenScope
import org.openapitools.client.models.SignupChallengeRequest
import org.openapitools.client.models.SignupChallengeRequestEmail
import org.openapitools.client.models.WorkflowFixtureResult

internal object FootprintQueries {
    suspend fun getOnboardingConfig(
        publicKey: String?,
        authToken: String?
    ): PublicOnboardingConfiguration {
        val api = OnboardingApi()
        val response =
            api.hostedOnboardingConfigGet(
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
    ): IdentifyResponse{
        val api = IdentifyApi()
        val response = api.hostedIdentifyPost(
            identifyRequest = IdentifyRequest(
                email = email, phoneNumber = phoneNumber, scope = scope
            ),
            xSandboxId = sandboxId,
            xFpAuthorization = authToken,
            xOnboardingConfigKey = publicKey
        )
        if(!response.success){
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = error.message
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
    ): IdentifyChallengeResponse{
        val api = IdentifyApi()
        val response = api.hostedIdentifySignupChallengePost(
            signupChallengeRequest = SignupChallengeRequest(
                challengeKind = kind,
                scope = scope,
                email = if(email != null) SignupChallengeRequestEmail(
                    isBootstrap = false,
                    value = email
                ) else null,
                phoneNumber = if(phoneNumber != null) SignupChallengeRequestEmail(
                    isBootstrap = false,
                    value = phoneNumber
                ) else null
            ),
            xSandboxId = sandboxId,
            xOnboardingConfigKey = publicKey,
            xFpIsComponentsSdk = true
        )

        if (!response.success){
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = error.message
            )
        }

        return  response.body()
    }

    suspend fun createLoginChallenge(
        authToken: String?,
        kind: ChallengeKind
    ): IdentifyChallengeResponse{
        val api = IdentifyApi()
        val response = api.hostedIdentifyLoginChallengePost(
            loginChallengeRequest = LoginChallengeRequest(
                challengeKind = kind
            ),
            xFpAuthorization = authToken
        )

        if (!response.success){
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = error.message
            )
        }

        return  response.body()
    }

    suspend fun verifyChallenge(
        challengeResponse: String,
        challengeToken: String,
        challengeAuthToken: String,
        scope: IdentifyScope
    ): IdentifyVerifyResponse{
        val api = IdentifyApi()
        val response = api.hostedIdentifyVerifyPost(
            identifyVerifyRequest = IdentifyVerifyRequest(
                challengeResponse = challengeResponse,
                challengeToken = challengeToken,
                scope = scope
            ),
            xFpAuthorization = challengeAuthToken
        )

        if (!response.success){
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = error.message
            )
        }

        return  response.body()
    }

    suspend fun validateOnboarding(authToken: String): HostedValidateResponse{
        val api = OnboardingApi()
        val response = api.hostedOnboardingValidatePost(
            xFpAuthorization = authToken
        )

        if (!response.success){
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.ONBOARDING_ERROR,
                message = error.message
            )
        }

        return  response.body()
    }

    suspend fun getValidationToken(authToken: String): HostedValidateResponse{
        val api = UserApi()
        val response = api.hostedIdentifyValidationTokenPost(
            xFpAuthorization = authToken
        )

        if (!response.success){
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.USER_ERROR,
                message = error.message
            )
        }

        return  response.body()
    }

    suspend fun initOnboarding(
        authToken: String,
        overallOutcome: OverallOutcome?
    ): OnboardingResponse{
        val api = OnboardingApi()
        val response = api.hostedOnboardingPost(
            postOnboardingRequest = PostOnboardingRequest(
                fixtureResult = when (overallOutcome){
                    OverallOutcome.PASS -> WorkflowFixtureResult.pass
                    OverallOutcome.FAIL -> WorkflowFixtureResult.fail
                    OverallOutcome.STEP_UP -> WorkflowFixtureResult.step_up
                    OverallOutcome.MANUAL_REVIEW -> WorkflowFixtureResult.manual_review
                    OverallOutcome.USE_RULES_OUTCOME -> WorkflowFixtureResult.use_rules_outcome
                    else -> null
                }
            ),
            xFpAuthorization = authToken
        )

        if (!response.success){
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.ONBOARDING_ERROR,
                message = error.message
            )
        }

        return  response.body()
    }

    suspend fun createVaultingToken(authToken: String): CreateUserTokenResponse{
        val api = UserApi()
        val response = api.hostedUserTokensPost(
            createUserTokenRequest = CreateUserTokenRequest(
                requestedScope = RequestedTokenScope.onboarding
            ),
            xFpAuthorization = authToken
        )

        if (!response.success){
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.USER_ERROR,
                message = error.message
            )
        }

        return  response.body()
    }

    suspend fun getOnboardingStatus(authToken: String): OnboardingStatusResponse {
        val api = OnboardingApi()
        val response = api.hostedOnboardingStatusGet(xFpAuthorization = authToken)
        if (!response.success) {
            val error = response.response.body<HttpError>()
            throw FootprintException(
                kind = FootprintException.ErrorKind.ONBOARDING_ERROR,
                message = error.message
            )
        }

        return response.body()
    }
}