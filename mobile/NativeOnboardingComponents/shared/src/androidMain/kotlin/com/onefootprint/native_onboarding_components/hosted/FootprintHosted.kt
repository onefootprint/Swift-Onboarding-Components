package com.onefootprint.native_onboarding_components.hosted

import android.app.Activity
import com.onefootprint.native_onboarding_components.Footprint.vaultingToken
import com.onefootprint.native_onboarding_components.Footprint.authToken
import com.onefootprint.native_onboarding_components.Footprint.sessionId
import com.onefootprint.native_onboarding_components.Footprint.authValidationToken
import com.onefootprint.native_onboarding_components.Footprint.l10n
import com.onefootprint.native_onboarding_components.Footprint.mutex
import com.onefootprint.native_onboarding_components.Footprint.onboardingConfig
import com.onefootprint.native_onboarding_components.Footprint.publicKey
import com.onefootprint.native_onboarding_components.Footprint.sandboxId
import com.onefootprint.native_onboarding_components.Footprint.sandboxOutcome
import com.onefootprint.native_onboarding_components.Footprint.verifiedAuthToken
import com.onefootprint.native_onboarding_components.FootprintQueries
import com.onefootprint.native_onboarding_components.models.FootprintException
import com.onefootprint.native_onboarding_components.models.VerificationResponse
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.sync.withLock
import org.openapitools.client.models.ObConfigurationKind

object FootprintHosted {
    suspend fun launchIdentify(
        context: Activity,
        email: String? = null,
        phone: String? = null,
        onCancel: (() -> Unit)? = null,
        onAuthenticated: ((response: VerificationResponse) -> Unit)? = null,
        onError: ((error: String) -> Unit)? = null,
        appearance: FootprintAppearance? = null
    ) {
        mutex.withLock {
            val configKind = onboardingConfig?.kind
                ?: throw FootprintException(
                    kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                    "No onboarding config kind found while attempting to launch hosted identify"
                )

            val hasEmailOrPhone = email != null || phone != null
            if (hasEmailOrPhone && authToken != null) {
                throw FootprintException(
                    kind = FootprintException.ErrorKind.AUTH_ERROR,
                    "Please don't use both email/phone and auth token at the same time"
                )
            }

            val onAuthenticationCompleteCallback: ((authToken: String, vToken: String) -> String) =
                { authToken: String, vToken: String ->
                    verifiedAuthToken = authToken
                    vaultingToken = vToken
                    runBlocking {
                        val validationToken = when (configKind) {
                            ObConfigurationKind.auth -> {
                                // It's unlikely that we will reach this block because onCompleteCallback below will take care of it
                                val validationTokenResponse = FootprintQueries.validateOnboarding(authToken)
                                authValidationToken = validationTokenResponse.validationToken
                                onAuthenticated?.invoke(VerificationResponse(validationToken = validationTokenResponse.validationToken))
                                validationTokenResponse.validationToken
                            }
                            ObConfigurationKind.kyc -> {
                                val validationTokenResponse = FootprintQueries.getValidationToken(authToken)
                                authValidationToken = validationTokenResponse.validationToken
                                onAuthenticated?.invoke(VerificationResponse(validationToken = validationTokenResponse.validationToken))
                                validationTokenResponse.validationToken
                            }
                            else -> {
                                throw FootprintException(
                                    kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                                    message = "Only KYC or auth playbooks are supported for hosted identity"
                                )
                            }
                        }
                        return@runBlocking validationToken
                    }
                }

            val onCompleteCallback: ((String) -> Unit) = { validationToken: String ->
                if(configKind == ObConfigurationKind.auth) {
                    onAuthenticated?.invoke(
                        VerificationResponse(validationToken = validationToken)
                    )
                }
            }

            val activityClassName = context.javaClass.name

            val userData = FootprintBootstrapData(
                email = email,
                phoneNumber = phone,
            )
            val config = FootprintConfiguration(
                redirectActivityName = activityClassName,
                publicKey = publicKey,
                authToken = authToken,
                bootstrapData = userData,
                l10n = l10n,
                appearance = appearance,
                onAuthenticationComplete = onAuthenticationCompleteCallback,
                onComplete = onCompleteCallback,
                onCancel = onCancel,
                onError = onError,
                overallOutcome = sandboxOutcome?.overallOutcome,
                documentOutcome = sandboxOutcome?.documentOutcome,
                sandboxId = sandboxId,
                isAuthPlaybook = configKind == ObConfigurationKind.auth,
                shouldRelayToComponents = true,
                isComponentSdk = true,
                sessionId = sessionId
            )
            FootprintHostedInternal.init(
                context = context,
                config = config
            )
        }
    }

    suspend fun handoff(
        context: Activity,
        onComplete: ((validationToken: String) -> Unit)? = null,
        onCancel: (() -> Unit)? = null,
        onError: ((error: String) -> Unit)? = null,
        appearance: FootprintAppearance? = null
    ) {
        mutex.withLock {
            val configKind = onboardingConfig?.kind
                ?: throw FootprintException(
                    kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                    "No onboarding config kind found while attempting to launch hosted identify"
                )

            if (configKind != ObConfigurationKind.kyc) {
                throw FootprintException(
                    kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                    "Only KYC playbooks are supported"
                )
            }

            val authToken = verifiedAuthToken
                ?: throw FootprintException(
                    kind = FootprintException.ErrorKind.AUTH_ERROR,
                    "Auth token missing. Please authenticate before calling handoff"
                )

            val activityClassName = context.javaClass.name

            val config = FootprintConfiguration(
                redirectActivityName = activityClassName,
                publicKey = publicKey,
                authToken = authToken,
                l10n = l10n,
                appearance = appearance,
                onComplete = onComplete,
                onCancel = onCancel,
                onError = onError,
                overallOutcome = sandboxOutcome?.overallOutcome,
                documentOutcome = sandboxOutcome?.documentOutcome,
                sandboxId = sandboxId,
                isAuthPlaybook = false,
                shouldRelayToComponents = false,
                isComponentSdk = true,
                sessionId = sessionId
            )
            FootprintHostedInternal.init(
                context = context,
                config = config
            )
        }
    }
}