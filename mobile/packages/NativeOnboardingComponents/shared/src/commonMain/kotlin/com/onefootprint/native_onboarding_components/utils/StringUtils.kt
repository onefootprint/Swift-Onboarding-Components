package com.onefootprint.native_onboarding_components.utils

internal fun generateRandomString(length: Int = 12): String {
    val chars = ('A'..'Z') + ('a'..'z') + ('0'..'9')
    return (1..length)
        .map { chars.random() }
        .joinToString("")
}