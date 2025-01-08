package com.onefootprint.native_onboarding_components.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.openapitools.client.models.Language
import org.openapitools.client.models.Locale


typealias FootprintSupportedLocale = Locale
typealias FootprintSupportedLanguage  = Language

@Serializable
data class Translation(
    @SerialName("email") val email: EmailTranslation? = null,
    @SerialName("phone") val phone: PhoneTranslation? = null,
    @SerialName("dob") val dob: DobTranslation? = null,
    @SerialName("ssn4") val ssn4: SsnTranslation? = null,
    @SerialName("ssn9") val ssn9: SsnTranslation? = null,
    @SerialName("firstName") val firstName: FirstNameTranslation? = null,
    @SerialName("lastName") val lastName: LastNameTranslation? = null,
    @SerialName("middleName") val middleName: MiddleNameTranslation? = null,
    @SerialName("country") val country: CountryTranslation? = null,
    @SerialName("state") val state: StateTranslation? = null,
    @SerialName("city") val city: CityTranslation? = null,
    @SerialName("zipCode") val zipCode: ZipCodeTranslation? = null,
    @SerialName("addressLine1") val addressLine1: AddressTranslation? = null
)

@Serializable
data class EmailTranslation(
    @SerialName("required") val required: String? = null,
    @SerialName("invalid") val invalid: String? = null
)

@Serializable
data class PhoneTranslation(
    @SerialName("required") val required: String? = null,
    @SerialName("invalid") val invalid: String? = null
)

@Serializable
data class DobTranslation(
    @SerialName("required") val required: String? = null,
    @SerialName("invalid") val invalid: String? = null,
    @SerialName("tooOld") val tooOld: String? = null,
    @SerialName("tooYoung") val tooYoung: String? = null,
    @SerialName("inTheFuture") val inTheFuture: String? = null
)

@Serializable
data class SsnTranslation(
    @SerialName("required") val required: String? = null,
    @SerialName("invalid") val invalid: String? = null
)

@Serializable
data class FirstNameTranslation(
    @SerialName("required") val required: String? = null,
    @SerialName("invalid") val invalid: String? = null
)

@Serializable
data class LastNameTranslation(
    @SerialName("required") val required: String? = null,
    @SerialName("invalid") val invalid: String? = null
)

@Serializable
data class MiddleNameTranslation(
    @SerialName("invalid") val invalid: String? = null
)

@Serializable
data class CountryTranslation(
    @SerialName("required") val required: String? = null,
    @SerialName("invalid") val invalid: String? = null
)

@Serializable
data class StateTranslation(
    @SerialName("required") val required: String? = null
)

@Serializable
data class CityTranslation(
    @SerialName("required") val required: String? = null
)

@Serializable
data class ZipCodeTranslation(
    @SerialName("required") val required: String? = null
)

@Serializable
data class AddressTranslation(
    @SerialName("required") val required: String? = null
)

@Serializable
data class FootprintL10n(
    @SerialName("locale") val locale: FootprintSupportedLocale? = FootprintSupportedLocale.en_US,
    @SerialName("language") val language: FootprintSupportedLanguage? = FootprintSupportedLanguage.en,
    @SerialName("translation") val translation: Translation? = null
)