package com.onefootprint.native_onboarding_components.validations

import com.onefootprint.native_onboarding_components.models.Translation

object NameValidator {

    enum class NameTypes(val displayName: String) {
        FIRST_NAME("First name"),
        LAST_NAME("Last name"),
        MIDDLE_NAME("Middle name")
    }

    fun validateName(value: String, type: NameTypes, translation: Translation? = null): String? {
        val displayName = type.displayName
        val firstNameTranslation = translation?.firstName
        val lastNameTranslation = translation?.lastName
        val middleNameTranslation = translation?.middleName

        val requiredTranslation: String?
        val invalidTranslation: String?

        when (type) {
            NameTypes.FIRST_NAME -> {
                requiredTranslation = firstNameTranslation?.required
                invalidTranslation = firstNameTranslation?.invalid
            }
            NameTypes.LAST_NAME -> {
                requiredTranslation = lastNameTranslation?.required
                invalidTranslation = lastNameTranslation?.invalid
            }
            NameTypes.MIDDLE_NAME -> {
                requiredTranslation = null
                invalidTranslation = middleNameTranslation?.invalid
            }
        }

        if (type != NameTypes.MIDDLE_NAME && value.isBlank()) {
            return requiredTranslation ?: "$displayName cannot be empty"
        }

        if (type == NameTypes.MIDDLE_NAME && value.isBlank()) {
            return null
        }

        val trimmedName = value.trim()
        val allowedChars = Regex("^[^@#$%^*()_+=~/\\\\<>~`\\[\\]{}!?;:]+\$")
        val isValid = allowedChars.matches(trimmedName)

        if (!isValid) {
            return invalidTranslation ?: "Invalid ${displayName.lowercase()}"
        }

        return null
    }
}