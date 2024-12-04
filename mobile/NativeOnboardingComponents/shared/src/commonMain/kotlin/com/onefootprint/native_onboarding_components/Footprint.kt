package com.onefootprint.native_onboarding_components

import com.onefootprint.native_onboarding_components.models.AuthTokenStatus
import com.onefootprint.native_onboarding_components.models.DocumentOutcome
import com.onefootprint.native_onboarding_components.models.FootprintAuthMethods
import com.onefootprint.native_onboarding_components.models.FootprintAuthRequirement
import com.onefootprint.native_onboarding_components.models.FootprintException
import com.onefootprint.native_onboarding_components.models.FootprintL10n
import com.onefootprint.native_onboarding_components.models.FootprintSupportedLanguage
import com.onefootprint.native_onboarding_components.models.FootprintSupportedLocale
import com.onefootprint.native_onboarding_components.models.OverallOutcome
import com.onefootprint.native_onboarding_components.models.SandboxOutcome
import com.onefootprint.native_onboarding_components.models.VerificationResponse
import com.onefootprint.native_onboarding_components.utils.AuthUtils
import com.onefootprint.native_onboarding_components.utils.generateRandomString
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import org.openapitools.client.models.IdentifyChallengeResponse
import org.openapitools.client.models.ObConfigurationKind
import org.openapitools.client.models.PublicOnboardingConfiguration

object Footprint {
    internal var publicKey: String? = null
    internal var authToken: String? = null
    internal var verifiedAuthToken: String? = null
    internal var vaultingToken: String? = null
    private var authTokenStatus: AuthTokenStatus? = null
    internal var authValidationToken: String? = null
    private var vaultData: String? = null // TODO: update the type here
    internal var onboardingConfig: PublicOnboardingConfiguration? = null
    private var challenge: IdentifyChallengeResponse? = null

    internal var sandboxId: String? = null
    internal var sandboxOutcome: SandboxOutcome? = null
    private var isReady: Boolean = false
    internal var l10n: FootprintL10n = FootprintL10n(
        locale = FootprintSupportedLocale.EN_US,
        language = FootprintSupportedLanguage.ENGLISH
    )

    // To ensure that only one coroutine can modify the state of the Footprint object at any given time
    // private functions won't have to use the mutex
    internal val mutex = Mutex()

    private fun reset() {
        publicKey = null
        authToken = null
        verifiedAuthToken = null
        vaultingToken = null
        authTokenStatus = null
        authValidationToken = null
        vaultData = null
        onboardingConfig = null
        challenge = null
        sandboxId = null
        sandboxOutcome = null
        isReady = false
        l10n = FootprintL10n(
            locale = FootprintSupportedLocale.EN_US,
            language = FootprintSupportedLanguage.ENGLISH
        )
    }

    suspend fun initialize(
        publicKey: String? = null,
        authToken: String? = null,
        sandboxId: String? = null,
        sandboxOutcome: SandboxOutcome? = null
    ): FootprintAuthRequirement {
        mutex.withLock {
            reset()
            if (publicKey == null && authToken == null) {
                throw FootprintException(
                    kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                    message = "Must provide public key or auth token"
                )
            }

            try {
                onboardingConfig = FootprintQueries.getOnboardingConfig(
                    publicKey = publicKey,
                    authToken = authToken
                )
                this.publicKey = publicKey
                this.authToken = authToken
            } catch (e: Exception) {
                reset()
                throw e
            }

            if (onboardingConfig == null) {
                reset()
                throw FootprintException(
                    kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                    message = "Something went wrong. Fetched onboarding config is null"
                )
            }

            if (onboardingConfig!!.kind != ObConfigurationKind.kyc) {
                reset()
                throw FootprintException(
                    kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                    message = "Only KYC playbooks are supported"
                )
            }

            if (onboardingConfig!!.isLive) {
                this.sandboxId = null
                this.sandboxOutcome = null
            } else {
                if (sandboxId?.any { !it.isLetterOrDigit() } == true) {
                    reset()
                    throw FootprintException(
                        kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                        message = "Invalid sandboxId. Can only contain alphanumeric characters."
                    )
                }
                this.sandboxId = sandboxId ?: generateRandomString()
                val requiresDocument = onboardingConfig!!.requiresIdDoc
                val overallOutcome = sandboxOutcome?.overallOutcome ?: OverallOutcome.PASS
                val documentOutcome = if (requiresDocument) sandboxOutcome?.documentOutcome
                    ?: DocumentOutcome.PASS else null
                this.sandboxOutcome = SandboxOutcome(
                    overallOutcome = overallOutcome,
                    documentOutcome = documentOutcome
                )
            }
            try {
                authTokenStatus = AuthUtils.validateAuthToken(
                    onboardingConfig = onboardingConfig,
                    authToken = authToken
                )

                when (authTokenStatus) {
                    AuthTokenStatus.VALID_WITH_SUFFICIENT_SCOPE ->
                        return FootprintAuthRequirement(requiresAuth = false, authMethod = null)

                    AuthTokenStatus.VALID_WITH_INSUFFICIENT_SCOPE ->
                        return FootprintAuthRequirement(
                            requiresAuth = true,
                            authMethod = FootprintAuthMethods.AUTH_TOKEN
                        )

                    else ->
                        return FootprintAuthRequirement(
                            requiresAuth = true,
                            authMethod = FootprintAuthMethods.EMAIL_PHONE
                        )
                }
            } catch (e: Exception) {
                reset()
                throw e
            }
        }
    }

    suspend fun createChallenge(email: String? = null, phoneNumber: String? = null): String {
        mutex.withLock {
            challenge = AuthUtils.createChallenge(
                publicKey = publicKey,
                email = email,
                phoneNumber = phoneNumber,
                onboardingConfig = onboardingConfig,
                authToken = authToken,
                sandboxId = sandboxId
            )
            return challenge!!.challengeData.challengeKind.toString()
        }
    }

    suspend fun verify(
        verificationCode: String
    ): VerificationResponse {
        mutex.withLock {
            val verificationResponseInternal = AuthUtils.verify(
                challenge = challenge,
                challengeResponse = verificationCode,
                onboardingConfig = onboardingConfig,
                overallOutcome = sandboxOutcome?.overallOutcome
            )
            verifiedAuthToken = verificationResponseInternal.authToken
            authValidationToken = verificationResponseInternal.validationToken
            vaultingToken = verificationResponseInternal.vaultingToken

            return VerificationResponse(
                validationToken = verificationResponseInternal.validationToken
            )
        }
    }
}