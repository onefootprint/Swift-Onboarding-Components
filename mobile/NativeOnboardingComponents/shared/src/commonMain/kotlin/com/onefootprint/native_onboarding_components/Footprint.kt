package com.onefootprint.native_onboarding_components

import com.onefootprint.native_onboarding_components.models.AuthTokenStatus
import com.onefootprint.native_onboarding_components.models.DocumentOutcome
import com.onefootprint.native_onboarding_components.models.FootprintException
import com.onefootprint.native_onboarding_components.models.OverallOutcome
import com.onefootprint.native_onboarding_components.models.SandboxOutcome
import com.onefootprint.native_onboarding_components.utils.generateRandomString
import org.openapitools.client.models.IdentifyChallengeResponse
import org.openapitools.client.models.ObConfigurationKind
import org.openapitools.client.models.PublicOnboardingConfiguration

object Footprint {
    private var publicKey: String? = null
    private var authToken: String? = null
    private var verifiedAuthToken: String? = null
    private var vaultingToken: String? = null
    private var authTokenStatus: AuthTokenStatus? = null
    private var authValidationToken: String? = null
    private var vaultData: String? = null // TODO: update the type here
    private var onboardingConfig: PublicOnboardingConfiguration? = null
    private var challengeResponse: IdentifyChallengeResponse? = null

    // TODO: add requirements field (check we actually need requirements field)
    private var sandboxId: String? = null
    private var sandboxOutcome: SandboxOutcome? = null
    private var isReady: Boolean = false
    // TODO: add l10n
    // TODO: add appearance

    private fun reset() {
        publicKey = null
        authToken = null
        verifiedAuthToken = null
        vaultingToken = null
        authTokenStatus = null
        authValidationToken = null
        vaultData = null
        onboardingConfig = null
        challengeResponse = null
        sandboxId = null
        sandboxOutcome = null
        isReady = false
    }

    suspend fun initialize(
        publicKey: String? = null,
        authToken: String? = null,
        sandboxId: String? = null,
        sandboxOutcome: SandboxOutcome? = null
    ) {
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
        }catch (e: Exception){
            println(e)
        }

        if(onboardingConfig == null){
            reset()
            throw FootprintException(
                kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                message = "Something went wrong. Fetched onboarding config is null"
            )
        }

        if(onboardingConfig!!.kind != ObConfigurationKind.kyc){
            reset()
            throw FootprintException(
                kind = FootprintException.ErrorKind.INITIALIZATION_ERROR,
                message = "Only KYC playbooks are supported"
            )
        }

        if(onboardingConfig!!.isLive){
            this.sandboxId = null
            this.sandboxOutcome = null
        }else{
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
            val documentOutcome = if(requiresDocument) sandboxOutcome?.documentOutcome ?: DocumentOutcome.PASS else null
            this.sandboxOutcome = SandboxOutcome(overallOutcome = overallOutcome, documentOutcome = documentOutcome)
        }
    }
}