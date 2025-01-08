package com.onefootprint.native_onboarding_components

import com.onefootprint.native_onboarding_components.models.AuthTokenStatus
import com.onefootprint.native_onboarding_components.models.FootprintAuthMethods
import com.onefootprint.native_onboarding_components.models.FootprintAuthRequirement
import com.onefootprint.native_onboarding_components.models.FootprintException
import com.onefootprint.native_onboarding_components.models.FootprintL10n
import com.onefootprint.native_onboarding_components.models.FootprintSupportedLanguage
import com.onefootprint.native_onboarding_components.models.FootprintSupportedLocale
import com.onefootprint.native_onboarding_components.models.Requirements
import com.onefootprint.native_onboarding_components.models.SandboxOutcome
import com.onefootprint.native_onboarding_components.models.VerificationResponse
import com.onefootprint.native_onboarding_components.utils.AuthUtils
import com.onefootprint.native_onboarding_components.utils.RequirementUtil
import com.onefootprint.native_onboarding_components.utils.VaultUtils
import com.onefootprint.native_onboarding_components.utils.generateRandomString
import io.ktor.client.engine.ProxyBuilder
import io.ktor.client.engine.http
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.request.header
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import org.openapitools.client.models.DataIdentifier
import org.openapitools.client.models.DocumentFixtureResult
import org.openapitools.client.models.IdentifyChallengeResponse
import org.openapitools.client.models.ObConfigurationKind
import org.openapitools.client.models.PublicOnboardingConfiguration
import org.openapitools.client.models.VaultData
import org.openapitools.client.models.WorkflowFixtureResult
import kotlin.coroutines.cancellation.CancellationException
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

object Footprint {
    internal var publicKey: String? = null
    internal var sessionId: String? = null
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
    var l10n: FootprintL10n = FootprintL10n(
        locale = FootprintSupportedLocale.en_US,
        language = FootprintSupportedLanguage.en
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
            locale = FootprintSupportedLocale.en_US,
            language = FootprintSupportedLanguage.en
        )
        sessionId = null
    }

    @Throws(FootprintException::class, CancellationException::class)
    @OptIn(ExperimentalUuidApi::class)
    suspend fun initialize(
        publicKey: String? = null,
        authToken: String? = null,
        sandboxId: String? = null,
        sandboxOutcome: SandboxOutcome? = null,
        l10n: FootprintL10n? = null,
        sessionId: String? = Uuid.random().toString(),
    ): FootprintAuthRequirement {
        mutex.withLock {
            reset()
            this.sessionId = sessionId

            FootprintQueries.initialize(httpClientConfig = {
//                it.engine {
//                    proxy = ProxyBuilder.http("http://10.212.87.99:9090")
//                }
                it.defaultRequest {
                    header("X-Fp-Session-Id", sessionId)
                    header("X-Fp-Client-Version", "${getPackage().name} ${getPackage().version}")
                }
            })
            if (publicKey == null && authToken == null) {
                throw FootprintException(
                    kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                    message = "Must provide public key or auth token"
                )
            }

            if (l10n != null) {
                this.l10n = l10n
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
                val overallOutcome = sandboxOutcome?.overallOutcome ?: WorkflowFixtureResult.pass
                val documentOutcome = if (requiresDocument) sandboxOutcome?.documentOutcome
                    ?: DocumentFixtureResult.pass else null
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

    @Throws(FootprintException::class, CancellationException::class)
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

    @Throws(FootprintException::class, CancellationException::class)
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

    @Throws(FootprintException::class, CancellationException::class)
    suspend fun getRequirements(): Requirements {
        mutex.withLock {
            return RequirementUtil.getRequirements(authToken = verifiedAuthToken)
        }
    }

    @Throws(FootprintException::class, CancellationException::class)
    suspend fun vault(data: VaultData) {
        mutex.withLock {
            VaultUtils.vaultData(
                data = data,
                authToken = vaultingToken,
                locale = l10n.locale ?: FootprintSupportedLocale.en_US
            )
        }
    }

    @Throws(FootprintException::class, CancellationException::class)
    suspend fun getVaultData(fields: List<DataIdentifier>): VaultData {
        mutex.withLock {
            return VaultUtils.decryptVaultData(
                authToken = verifiedAuthToken,
                fields = fields,
                locale = l10n.locale ?: FootprintSupportedLocale.en_US
            )
        }
    }

    @Throws(FootprintException::class, CancellationException::class)
    suspend fun process(): String {
        mutex.withLock {
            val authToken = verifiedAuthToken
            val overallOutcome = sandboxOutcome?.overallOutcome

            if (authToken == null) {
                throw FootprintException(
                    kind = FootprintException.ErrorKind.ONBOARDING_ERROR,
                    message = "Could not process without an authToken"
                )
            }

            val requirements = RequirementUtil.getRequirements(authToken = authToken)
            if (!requirements.canProcessInline) {
                throw FootprintException(
                    kind = FootprintException.ErrorKind.INLINE_PROCESS_NOT_SUPPORTED,
                    message = "Inline processing is not supported. Make sure that all requirements are met or use the hosted handoff."
                )
            }

            FootprintQueries.process(
                authToken = authToken,
                overallOutcome = overallOutcome
            )

            // Another check to ensure that the requirements are met
            // to handle the step-up case
            val requirementsAfterProcessing = RequirementUtil.getRequirements(authToken = authToken)
            if (!requirementsAfterProcessing.canProcessInline) {
                throw FootprintException(
                    kind = FootprintException.ErrorKind.INLINE_PROCESS_NOT_SUPPORTED,
                    message = "Inline processing is not supported. Make sure that all requirements are met or use the hosted handoff."
                )
            }

            val validationToken = FootprintQueries.validateOnboarding(
                authToken = authToken
            ).validationToken

            return validationToken
        }
    }
}