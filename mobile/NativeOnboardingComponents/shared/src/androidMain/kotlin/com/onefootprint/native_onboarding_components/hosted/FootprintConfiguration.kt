package com.onefootprint.native_onboarding_components.hosted

import com.onefootprint.native_onboarding_components.models.DocumentOutcome
import com.onefootprint.native_onboarding_components.models.FootprintL10n
import com.onefootprint.native_onboarding_components.models.OverallOutcome
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient

@Serializable
internal data class FootprintConfiguration(
    @Transient val redirectActivityName: String? = null,
    @Transient val sessionId: String? = null,
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
internal data class FootprintBootstrapData(
    @SerialName("id.email") val email: String? = null,
    @SerialName("id.phone_number") val phoneNumber: String? = null,
    @SerialName("id.first_name") val firstName: String? = null,
    @SerialName("id.middle_name") val middleName: String? = null,
    @SerialName("id.last_name") val lastName: String? = null,
    @SerialName("id.dob") val dob: String? = null,
    @SerialName("id.address_line1") val addressLine1: String? = null,
    @SerialName("id.address_line2") val addressLine2: String? = null,
    @SerialName("id.city") val city: String? = null,
    @SerialName("id.state") val state: String? = null,
    @SerialName("id.country") val country: String? = null,
    @SerialName("id.zip") val zip: String? = null,
    @SerialName("id.ssn9") val ssn9: String? = null,
    @SerialName("id.ssn4") val ssn4: String? = null,
    @SerialName("id.nationality") val nationality: String? = null,
    @SerialName("id.us_legal_status") val usLegalStatus: String? = null,
    @SerialName("id.citizenships") val citizenships: List<String>? = null,
    @SerialName("id.visa_kind") val visaKind: String? = null,
    @SerialName("id.itin") val itin: String? = null,
    @SerialName("id.us_tax_id") val usTaxId: String? = null,
    @SerialName("id.drivers_license_number") val driversLicenseNumber: String? = null,
    @SerialName("id.drivers_license_state") val driversLicenseState: String? = null,
    @SerialName("id.visa_expiration_date") val visaExpirationDate: String? = null,
    @SerialName("business.address_line1") val businessAddressLine1: String? = null,
    @SerialName("business.address_line2") val businessAddressLine2: String? = null,
    @SerialName("business.city") val businessCity: String? = null,
    @SerialName("business.corporation_type") val businessCorporationType: String? = null,
    @SerialName("business.country") val businessCountry: String? = null,
    @SerialName("business.dba") val businessDba: String? = null,
    @SerialName("business.name") val businessName: String? = null,
    @SerialName("business.phone_number") val businessPhoneNumber: String? = null,
    @SerialName("business.state") val businessState: String? = null,
    @SerialName("business.tin") val businessTin: String? = null,
    @SerialName("business.website") val businessWebsite: String? = null,
    @SerialName("business.zip") val businessZip: String? = null
)

@Serializable
internal data class FootprintOptions(
    @SerialName("show_completion_page") val showCompletionPage: Boolean? = null,
    @SerialName("show_logo") val showLogo: Boolean? = null
)