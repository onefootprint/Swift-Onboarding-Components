package com.onefootprint.native_onboarding_components.utils

import com.onefootprint.native_onboarding_components.FootprintQueries
import com.onefootprint.native_onboarding_components.models.AuthTokenStatus
import com.onefootprint.native_onboarding_components.models.FootprintException
import com.onefootprint.native_onboarding_components.models.OverallOutcome
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.IO
import kotlinx.coroutines.async
import kotlinx.coroutines.runBlocking
import org.openapitools.client.models.AuthMethodKind
import org.openapitools.client.models.ChallengeKind
import org.openapitools.client.models.IdentifyChallengeResponse
import org.openapitools.client.models.IdentifyScope
import org.openapitools.client.models.ObConfigurationKind
import org.openapitools.client.models.PublicOnboardingConfiguration

internal class VerificationResponseInternal(
    val authToken: String,
    val validationToken: String,
    val vaultingToken: String? = null
)

internal object AuthUtils {
    suspend fun validateAuthToken(
        onboardingConfig: PublicOnboardingConfiguration?,
        authToken: String?
    ): AuthTokenStatus? {
        if (authToken == null) return null
        if (onboardingConfig?.kind == null) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                message = "While validating auth token, no onboarding config kind found"
            )
        }

        // TODO: a little risky assumption in a multithreaded case
        val configKind = onboardingConfig.kind

        // We still don't support auth in OBC; but in this function we are considering it even though we don't have to
        val identifyScope =
            if (configKind == ObConfigurationKind.auth) IdentifyScope.auth else IdentifyScope.onboarding
        try {
            // Auth token identification doesn't need sandbox ID or public key
            val identifyResponse = FootprintQueries.identify(
                authToken = authToken,
                scope = identifyScope
            )
            val tokenScopes = identifyResponse.user?.tokenScopes
            return if (!tokenScopes.isNullOrEmpty()) {
                AuthTokenStatus.VALID_WITH_SUFFICIENT_SCOPE
            } else {
                AuthTokenStatus.VALID_WITH_INSUFFICIENT_SCOPE
            }
        } catch (e: Exception) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                message = "Auth token could not be identified! ${e.message}"
            )
        }
    }

    suspend fun createChallenge(
        publicKey: String?,
        email: String?,
        phoneNumber: String?,
        onboardingConfig: PublicOnboardingConfiguration?,
        authToken: String?,
        sandboxId: String?
    ): IdentifyChallengeResponse {
        if (onboardingConfig == null) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                message = "No onboarding config was found. Please make sure that the flow was initialized with the correct public key or auth token"
            )
        }

        if (onboardingConfig.requiredAuthMethods.isNullOrEmpty()) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = "No required auth methods found"
            )
        }

        if (onboardingConfig.requiredAuthMethods.size > 1) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.INLINE_OTP_NOT_SUPPORTED,
                message = "Multiple auth methods are not supported"
            )
        }

        if (authToken == null && email.isNullOrEmpty() && phoneNumber.isNullOrEmpty()) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = "Please provide email or phone number"
            )
        }

        if (authToken != null && (!email.isNullOrEmpty() || !phoneNumber.isNullOrEmpty())) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = "Cannot pass email/phone. You provided an auth token and must complete auth using it."
            )
        }

        if (authToken == null &&
            onboardingConfig.requiredAuthMethods[0] == AuthMethodKind.email &&
            email.isNullOrEmpty()
        ) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = "Email is required"
            )
        }

        if (authToken == null &&
            onboardingConfig.requiredAuthMethods[0] == AuthMethodKind.phone &&
            phoneNumber.isNullOrEmpty()
        ) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = "Phone number is required"
            )
        }

        val configKind = onboardingConfig.kind
        val scope =
            if (configKind == ObConfigurationKind.auth) IdentifyScope.auth else IdentifyScope.onboarding
        val identifyResponse = FootprintQueries.identify(
            authToken = authToken,
            email = email,
            phoneNumber = phoneNumber,
            scope = scope,
            sandboxId = sandboxId,
            publicKey = publicKey
        )
        val user = identifyResponse.user
        val requiredAuthMethods = onboardingConfig.requiredAuthMethods
        if (user == null) {
            return FootprintQueries.createSignUpChallenge(
                email = email,
                phoneNumber = phoneNumber,
                kind = if (requiredAuthMethods[0] == AuthMethodKind.phone) ChallengeKind.sms else ChallengeKind.email,
                sandboxId = sandboxId,
                scope = scope,
                publicKey = publicKey
            )
        } else {
            val hasVerifiedSource = user.authMethods.any { it.isVerified }
            if (!hasVerifiedSource) {
                throw FootprintException(
                    kind = FootprintException.ErrorKind.INLINE_OTP_NOT_SUPPORTED,
                    message = "Cannot authenticate inline. No verified sources found"
                )
            }
            val hasVerifiedPhone =
                user.authMethods.any { it.kind == AuthMethodKind.phone && it.isVerified }
            val hasVerifiedEmail =
                user.authMethods.any { it.kind == AuthMethodKind.email && it.isVerified }
            if (requiredAuthMethods.contains(AuthMethodKind.phone) && !hasVerifiedPhone) {
                throw FootprintException(
                    kind = FootprintException.ErrorKind.INLINE_OTP_NOT_SUPPORTED,
                    message = "Phone is required but has not been verified"
                )
            }
            if (requiredAuthMethods.contains(AuthMethodKind.email) && !hasVerifiedEmail) {
                throw FootprintException(
                    kind = FootprintException.ErrorKind.INLINE_OTP_NOT_SUPPORTED,
                    message = "Email is required but has not been verified"
                )
            }
            if (hasVerifiedPhone) {
                return FootprintQueries.createLoginChallenge(
                    authToken = user.token,
                    kind = ChallengeKind.sms
                )
            }
            if (hasVerifiedEmail) {
                return FootprintQueries.createLoginChallenge(
                    authToken = user.token,
                    kind = ChallengeKind.email
                )
            }
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = "Something went wrong while creating challenge"
            )
        }
    }

    suspend fun verify(
        challenge: IdentifyChallengeResponse?,
        challengeResponse: String,
        onboardingConfig: PublicOnboardingConfiguration?,
        overallOutcome: OverallOutcome?
    ): VerificationResponseInternal {
        if (onboardingConfig == null) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                message = "No onboarding config found"
            )
        }

        if (challenge == null) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = "No challenge data found"
            )
        }

        val configKind = onboardingConfig.kind
        val scope =
            if (configKind == ObConfigurationKind.auth) IdentifyScope.auth else IdentifyScope.onboarding

        val verificationResponse = FootprintQueries.verifyChallenge(
            challengeResponse = challengeResponse,
            challengeToken = challenge.challengeData.challengeToken,
            challengeAuthToken = challenge.challengeData.token,
            scope = scope
        )

        val authTokenFromVerificationResponse = verificationResponse.authToken

        when (configKind) {
            ObConfigurationKind.auth -> {
                val validationToken =
                    FootprintQueries.validateOnboarding(authTokenFromVerificationResponse)
                return VerificationResponseInternal(
                    authToken = authTokenFromVerificationResponse,
                    validationToken = validationToken.validationToken
                )
            }

            else -> {
                val result = runBlocking {
                    val validationTokenReq = async(Dispatchers.IO) {
                        FootprintQueries.getValidationToken(authToken = authTokenFromVerificationResponse)
                    }
                    val updatedAuthTokenReq = async(Dispatchers.IO) {
                        FootprintQueries.initOnboarding(
                            authToken = authTokenFromVerificationResponse,
                            overallOutcome = overallOutcome
                        )
                    }

                    val validationToken = validationTokenReq.await().validationToken
                    val updatedAuthToken = updatedAuthTokenReq.await().authToken
                    val vaultingToken = FootprintQueries.createVaultingToken(updatedAuthToken).token

                    VerificationResponseInternal(
                        authToken = updatedAuthToken,
                        validationToken = validationToken,
                        vaultingToken = vaultingToken
                    )
                }
                return result
            }
        }
    }
}