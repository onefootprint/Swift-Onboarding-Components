package com.onefootprint.native_onboarding_components.models

enum class FootprintAuthMethods{
    EMAIL_PHONE, AUTH_TOKEN
}

class FootprintAuthRequirement(val requiresAuth: Boolean, val authMethod: FootprintAuthMethods?)