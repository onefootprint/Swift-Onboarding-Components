package com.footprint.verify

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class FootprintOptions(
    val showCompletionPage: Boolean? = null,
    val showLogo: Boolean? = null
)

@Serializable
data class FootprintUserData(
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
    @SerialName("id.visa_expiration_date") val visaExpirationDate: String? = null
)

@Serializable
internal data class Data(
    @SerialName("public_key") val publicKey: String,
    val options: FootprintOptions? = null,
    @SerialName("user_data") val userData: FootprintUserData? = null,
)

@Serializable
internal data class SdkRequestData(val kind: String, val data: Data)

@Serializable
internal data class SdkTokenResponse(
    val token: String,
    @SerialName("expires_at") val expiresAt: String
)