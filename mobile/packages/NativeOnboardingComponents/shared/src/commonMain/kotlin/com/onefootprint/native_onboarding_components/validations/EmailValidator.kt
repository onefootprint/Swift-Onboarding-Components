package com.onefootprint.native_onboarding_components.validations

import com.onefootprint.native_onboarding_components.models.Translation
import kotlin.text.Regex

object EmailValidator {
    // Main email validation function
    fun validateEmail(input: String, translation: Translation? = null): String? {
        if (input.isBlank()) {
            return translation?.email?.required ?: "Email is required"
        }

        val emailRegex = Regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")
        val domainParts = input.split("@")

        if (domainParts.size > 1 && ".." in domainParts[1]) {
            return translation?.email?.invalid ?: "Invalid email format"
        }

        val isValidEmail = emailRegex.matches(input)
        if (!isValidEmail) {
            return translation?.email?.invalid ?: "Invalid email format"
        }

        return null
    }

    // Function to validate if a string is a valid domain
    fun isEmailDomain(value: String): Boolean {
        val domainRegex = Regex("^[a-z0-9-]+(\\.[a-z0-9-]+)*\\.[a-z]{2,}$")
        return domainRegex.matches(value)
    }
}