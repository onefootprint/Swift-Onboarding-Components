package com.onefootprint.native_onboarding_components

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform