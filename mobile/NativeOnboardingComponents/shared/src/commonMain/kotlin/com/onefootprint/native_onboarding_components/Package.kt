package com.onefootprint.native_onboarding_components

interface Package {
    val name: String
    val version: String
}

expect fun getPackage(): Package
