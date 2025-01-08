package com.onefootprint.native_onboarding_components.hosted

import com.onefootprint.native_onboarding_components.models.DocumentOutcome
import com.onefootprint.native_onboarding_components.models.FootprintL10n
import com.onefootprint.native_onboarding_components.models.OverallOutcome
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient
import org.openapitools.client.models.BootstrapDataV1

typealias FootprintBootstrapData = BootstrapDataV1

@Serializable
internal data class FootprintConfiguration(
    @Transient val redirectActivityName: String? = null,
    @Transient val sessionId: String? = null,
    @Transient val scheme: String? = null,
    @SerialName("public_key") val publicKey: String? = null,
    @SerialName("auth_token") val authToken: String? = null,
    @SerialName("user_data") val bootstrapData: FootprintBootstrapData? = null,
    @SerialName("options") val options: FootprintOptions? = null,
    @SerialName("l10n") val l10n: FootprintL10n? = null,
    @SerialName("sandbox_id") val sandboxId: String? = null,
    @SerialName("fixture_result") val overallOutcome: OverallOutcome? = null,
    @SerialName("document_fixture_result") val documentOutcome: DocumentOutcome? = null,
    @SerialName("is_components_sdk") val isComponentSdk: Boolean? = null,
    @SerialName("should_relay_to_components") val shouldRelayToComponents: Boolean? = null,
    @Transient val cloudProjectNumber: Long? = null, // used for generating device attestations
    @Transient val appearance: FootprintAppearance? = null,
    @Transient val onComplete: ((validationToken: String) -> Unit)? = null,
    @Transient val onCancel: (() -> Unit)? = null,
    @Transient val onError: ((errorMessage: String) -> Unit)? = null,
    @Transient val isAuthPlaybook: Boolean = false,
    @Transient val onAuthenticationComplete: ((authToken: String, vaultingToken: String) -> String)? = null
) {
    init {
        require((publicKey != null).or(authToken != null)) {
            "PublicKey or authToken must be provided"
        }
    }
}

@Serializable
internal data class FootprintOptions(
    @SerialName("show_completion_page") val showCompletionPage: Boolean? = null,
    @SerialName("show_logo") val showLogo: Boolean? = null
)