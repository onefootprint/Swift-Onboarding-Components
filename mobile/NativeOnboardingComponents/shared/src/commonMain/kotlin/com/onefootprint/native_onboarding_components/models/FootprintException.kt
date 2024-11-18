package com.onefootprint.native_onboarding_components.models

class FootprintException(
    val kind: ErrorKind,
    override val message: String,
    val context: Map<String, String>? = null // Optional context for specific errors, usually will be used for vaulting error
) : Exception(message) {

    enum class ErrorKind {
        INITIALIZATION_ERROR,
        AUTH_ERROR,
        USER_ERROR,
        DECRYPTION_ERROR,
        VAULTING_ERROR,
        ONBOARDING_ERROR,
        INLINE_PROCESS_NOT_SUPPORTED,
        INLINE_OTP_NOT_SUPPORTED,
        NOT_ALLOWED,
        WEBVIEW_ERROR,
        UI_ERROR
    }

    // Override the toString() method to include kind, message, and context (if available)
    override fun toString(): String {
        val contextString = context?.let {
            it.entries.joinToString(", ") { (key, value) -> "$key=$value" }
        } ?: "No context available"

        return "FootprintException(kind=$kind, message=$message, context=$contextString)"
    }
}