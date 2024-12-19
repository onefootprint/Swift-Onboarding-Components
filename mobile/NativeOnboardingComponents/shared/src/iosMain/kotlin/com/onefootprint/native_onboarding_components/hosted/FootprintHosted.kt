package com.onefootprint.native_onboarding_components.hosted

import com.onefootprint.native_onboarding_components.models.VerificationResponse

actual class PlatformContext( )

internal actual fun getActivityClassName(context: PlatformContext): String {
    return "test"
}

internal actual fun handleSdkArgsToken(
    config: FootprintConfiguration,
    context: PlatformContext,
    token: String
) {
    // TODO
}


object FootprintHosted {
    suspend fun launchIdentify(
        email: String? = null,
        phone: String? = null,
        onCancel: (() -> Unit)? = null,
        onAuthenticated: ((response: VerificationResponse) -> Unit)? = null,
        onError: ((error: String) -> Unit)? = null,
        appearance: FootprintAppearance? = null
    ) {
        return FootprintHostedCommon.launchIdentify(
            PlatformContext(),
            email,
            phone,
            onCancel,
            onAuthenticated,
            onError,
            appearance
        )
    }
    suspend fun handoff(
        onComplete: ((validationToken: String) -> Unit)? = null,
        onCancel: (() -> Unit)? = null,
        onError: ((error: String) -> Unit)? = null,
        appearance: FootprintAppearance? = null
    ) {
        return FootprintHostedCommon.handoff(
            PlatformContext(),
            onComplete,
            onCancel,
            onError,
            appearance,
        )
    }
}