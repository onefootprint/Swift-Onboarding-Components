package com.onefootprint.native_onboarding_components

class IOSPackage : Package {
    override val name: String = "footprint-ios-onboarding-components"
    override val version: String = "1.0.0-beta"
}

actual fun getPackage(): Package = IOSPackage()
