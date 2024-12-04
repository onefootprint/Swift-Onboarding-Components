package com.onefootprint.native_onboarding_components.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class FootprintSupportedLocale {
    @SerialName("en-US") EN_US,
    @SerialName("es-MX") ES_MX
}

@Serializable
enum class FootprintSupportedLanguage {
    @SerialName("en") ENGLISH,
    @SerialName("es") SPANISH
}

@Serializable
data class FootprintL10n(
    @SerialName("locale") val locale: FootprintSupportedLocale? = null,
    @SerialName("language") val language: FootprintSupportedLanguage? = null
)