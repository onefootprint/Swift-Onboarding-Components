package com.onefootprint.native_onboarding_components.validations

import com.onefootprint.native_onboarding_components.models.FootprintSupportedLocale
import com.onefootprint.native_onboarding_components.models.Translation
import com.onefootprint.native_onboarding_components.utils.FootprintUtils
import com.onefootprint.native_onboarding_components.validations.NameValidator.NameTypes


object Validations {
    fun isDob(
        dob: String,
        locale: FootprintSupportedLocale    ,
        translation: Translation? = null
    ): String? {
        return DateOfBirthValidator.validateDob(dob, locale, translation)
    }

    fun isEmail(
        value: String,
        translation: Translation? = null
    ): String? {
        return EmailValidator.validateEmail(value, translation)
    }

    fun isName(
        value: String,
        type: NameTypes,
        translation: Translation? = null
    ): String? {
        return NameValidator.validateName(value, type, translation)
    }

    fun isPhoneNumberGeneric(value: String, translation: Translation? = null): String? {
        if (value.isBlank()) {
            return translation?.phone?.required ?: "Phone number is required"
        }

        // E.164 format: mandatory '+' followed by 1-15 digits
        val phoneNumberRegex = Regex("^\\+[1-9]\\d{1,14}$")
        val isValid = phoneNumberRegex.matches(value)

        if (!isValid) {
            return translation?.phone?.invalid ?: "Phone number is not valid"
        }

        return null
    }

    fun isSSN4(value: String, translation: Translation? = null): String? {
        if (value.isBlank()) {
            return translation?.ssn4?.required ?: "Last 4 digits of SSN are required"
        }
        // Regex pattern: 4 digits, not all zeroes (0000)
        val pattern = Regex("^((?!0000)\\d{4})$")
        val isValid = pattern.matches(value)

        return if (isValid) null else translation?.ssn4?.invalid
            ?: "Please enter valid last 4 digits of SSN"
    }


    fun isSSN9(
        value: String,
        isFlexible: Boolean = false,
        translation: Translation? = null
    ): String? {
        if (value.isBlank()) {
            return translation?.ssn9?.required ?: "SSN is required"
        }

        val strictPattern = "^(?!(000|666|9))(\\d{3}-(?!(00))\\d{2}-(?!(0000))\\d{4})$"
        val flexiblePattern = "^(?!(000|666|9))(\\d{3}-?(?!(00))\\d{2}-?(?!(0000))\\d{4})$"

        val pattern = if (isFlexible) flexiblePattern else strictPattern
        val regex = Regex(pattern)
        val isValid = regex.matches(value)

        return if (!isValid) {
            translation?.ssn9?.invalid ?: "SSN is invalid"
        } else null
    }

    fun isSupportedCountryCode(
        countryCode: String,
        translation: Translation? = null
    ): String? {
        if (countryCode.isBlank()) {
            return translation?.country?.required ?: "Country is required"
        }

        val isValid = FootprintUtils.isSupportedCountryCode(countryCode)
        return if (!isValid) {
            translation?.country?.invalid
                ?: "Please use a 2-letter country code e.g., \"US\", \"MX\", \"CA\""
        } else null
    }

}