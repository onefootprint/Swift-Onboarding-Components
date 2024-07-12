package com.footprint.android

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Serializable
data class FootprintAppearance(
    val fontSrc: String? = null,
    val rules: FootprintAppearanceRules? = null,
    val variables: FootprintAppearanceVariables? = null,
) {

    fun toJSON(): Map<String, String>? {
        val appearanceJson = mutableMapOf<String, String>()
        rules?.let { appearanceJson["rules"] = Json.encodeToString(rules) }
        variables?.let { appearanceJson["variables"] = Json.encodeToString(variables) }
        fontSrc?.let { appearanceJson["fontSrc"] = fontSrc }
        return if (appearanceJson.isEmpty()) null else appearanceJson
    }
}

@Serializable
data class FootprintAppearanceRules(
    val button: Map<String, String>? = null,
    @SerialName("button:hover") val buttonHover: Map<String, String>? = null,
    @SerialName("button:focus") val buttonFocus: Map<String, String>? = null,
    @SerialName("button:active") val buttonActive: Map<String, String>? = null,
    val input: Map<String, String>? = null,
    @SerialName("input:hover") val inputHover: Map<String, String>? = null,
    @SerialName("input:focus") val inputFocus: Map<String, String>? = null,
    @SerialName("input:active") val inputActive: Map<String, String>? = null,
    val pinInput: Map<String, String>? = null,
    @SerialName("pinInput:hover") val pinInputHover: Map<String, String>? = null,
    @SerialName("pinInput:focus") val pinInputFocus: Map<String, String>? = null,
    @SerialName("pinInput:active") val pinInputActive: Map<String, String>? = null,
    val label: Map<String, String>? = null,
    val hint: Map<String, String>? = null,
    val link: Map<String, String>? = null,
    @SerialName("linkButton") val linkButton: Map<String, String>? = null,
    @SerialName("link:hover") val linkHover: Map<String, String>? = null,
    @SerialName("link:active") val linkActive:Map<String, String>? = null,
    @SerialName("linkButton:hover") val linkButtonHover:Map<String, String>? = null,
    @SerialName("linkButton:focus") val linkButtonFocus:Map<String, String>? = null,
    @SerialName("linkButton:active") val linkButtonActive:Map<String, String>? = null,
)

@Serializable
data class FootprintAppearanceVariables(
    // globals
    val borderRadius: String? = null,
    val colorError: String? = null,
    val colorWarning: String? = null,
    val colorSuccess: String? = null,
    val colorAccent: String? = null,
    val borderColorError: String? = null,

    // container
    val containerBg: String? = null,
    val containerElevation: String? = null,
    val containerBorder: String? = null,
    val containerBorderRadius: String? = null,

    // link
    val linkColor: String? = null,

    // typography
    val fontFamily: String? = null,

    // label
    val labelColor: String? = null,
    val labelFont: String? = null,

    // input
    val inputBorderRadius: String? = null,
    val inputBorderWidth: String? = null,
    val inputFont: String? = null,
    val inputHeight: String? = null,
    val inputPlaceholderColor: String? = null,
    val inputColor: String? = null,
    val inputBg: String? = null,
    val inputBorderColor: String? = null,
    val inputElevation: String? = null,
    val inputHoverBg: String? = null,
    val inputHoverBorderColor: String? = null,
    val inputHoverElevation: String? = null,
    val inputFocusBg: String? = null,
    val inputFocusBorderColor: String? = null,
    val inputFocusElevation: String? = null,
    val inputErrorBg: String? = null,
    val inputErrorBorderColor: String? = null,
    val inputErrorElevation: String? = null,
    val inputErrorHoverBg: String? = null,
    val inputErrorHoverBorderColor: String? = null,
    val inputErrorHoverElevation: String? = null,
    val inputErrorFocusBg: String? = null,
    val inputErrorFocusBorderColor: String? = null,
    val inputErrorFocusElevation: String? = null,

    // hint
    val hintColor: String? = null,
    val hintErrorColor: String? = null,
    val hintFont: String? = null,

    // link button
    val linkButtonColor: String? = null,
    val linkButtonHoverColor: String? = null,
    val linkButtonActiveColor: String? = null,
    val linkButtonDestructiveColor: String? = null,
    val linkButtonDestructiveHoverColor: String? = null,
    val linkButtonDestructiveActiveColor: String? = null,

    // button
    val buttonBorderRadius: String? = null,
    val buttonBorderWidth: String? = null,
    val buttonElevation: String? = null,
    val buttonElevationHover: String? = null,
    val buttonElevationActive: String? = null,
    val buttonOutlineOffset: String? = null,
    val buttonPrimaryBg: String? = null,
    val buttonPrimaryColor: String? = null,
    val buttonPrimaryBorderColor: String? = null,
    val buttonPrimaryHoverBg: String? = null,
    val buttonPrimaryHoverColor: String? = null,
    val buttonPrimaryHoverBorderColor: String? = null,
    val buttonPrimaryActiveBg: String? = null,
    val buttonPrimaryActiveColor: String? = null,
    val buttonPrimaryActiveBorderColor: String? = null,
    val buttonPrimaryDisabledBg: String? = null,
    val buttonPrimaryDisabledColor: String? = null,
    val buttonPrimaryDisabledBorderColor: String? = null,
    val buttonPrimaryLoadingBg: String? = null,
    val buttonPrimaryLoadingColor: String? = null,
    val buttonsPrimaryLoadingBorderColor: String? = null,
    val buttonSecondaryBg: String? = null,
    val buttonSecondaryColor: String? = null,
    val buttonSecondaryBorderColor: String? = null,
    val buttonSecondaryHoverBg: String? = null,
    val buttonSecondaryHoverColor: String? = null,
    val buttonSecondaryHoverBorderColor: String? = null,
    val buttonSecondaryActiveBg: String? = null,
    val buttonSecondaryActiveColor: String? = null,
    val buttonSecondaryActiveBorderColor: String? = null,
    val buttonSecondaryDisabledBg: String? = null,
    val buttonSecondaryDisabledColor: String? = null,
    val buttonSecondaryDisabledBorderColor: String? = null,
    val buttonSecondaryLoadingBg: String? = null,
    val buttonSecondaryLoadingColor: String? = null,

    // Dropdown
    val dropdownBg: String? = null,
    val dropdownHoverBg: String? = null,
    val dropdownBorderColor: String? = null,
    val dropdownBorderWidth: String? = null,
    val dropdownBorderRadius: String? = null,
    val dropdownElevation: String? = null,
    val dropdownColorPrimary: String? = null,
    val dropdownColorSecondary: String? = null,
    val dropdownFooterBg: String? = null,

    // Radio select
    val radioSelectBg: String? = null,
    val radioSelectBorderRadius: String? = null,
    val radioSelectBorderWidth: String? = null,
    val radioSelectBorderColor: String? = null,
    val radioSelectHoverBg: String? = null,
    val radioSelectHoverBorderColor: String? = null,
    val radioSelectSelectedBg: String? = null,
    val radioSelectSelectedBorderColor: String? = null,
    val radioSelectComponentsIconBg: String? = null,
    val radioSelectComponentsIconHoverBg: String? = null,
    val radioSelectComponentsIconSelectedBg: String? = null,
)
