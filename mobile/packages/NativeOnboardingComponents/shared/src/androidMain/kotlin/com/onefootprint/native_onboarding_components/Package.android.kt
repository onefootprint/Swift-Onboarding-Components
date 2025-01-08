package com.onefootprint.native_onboarding_components

class AndroidPackage : Package {
    override val name: String = "footprint-android-onboarding-components"
    override val version: String = "1.0.0-beta"
}

actual fun getPackage(): Package = AndroidPackage()