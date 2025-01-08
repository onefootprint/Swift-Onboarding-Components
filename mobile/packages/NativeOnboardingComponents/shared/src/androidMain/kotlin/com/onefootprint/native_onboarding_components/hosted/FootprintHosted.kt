package com.onefootprint.native_onboarding_components.hosted

import android.app.Activity
import android.content.Intent
import com.onefootprint.native_onboarding_components.models.VerificationResponse

actual class PlatformContext(val activity: Activity)

internal actual fun getActivityClassName(context: PlatformContext): String {
    return context.activity::class.java.name
}

internal actual fun handleSdkArgsToken(
    config: FootprintConfiguration,
    context: PlatformContext,
    token: String
) {
    val url = FootprintHostedInternal.instance.getUrl(config, token)
    val activity = context.activity

    val intent = Intent(activity, HostedLauncherActivity::class.java)
    intent.putExtra("FOOTPRINT_VERIFICATION_FLOW_URL", url.toString())
    activity.startActivity(intent)
}

object FootprintHosted {
    suspend fun launchIdentify(
        context: Activity,
        email: String? = null,
        phone: String? = null,
        onCancel: (() -> Unit)? = null,
        onAuthenticated: ((response: VerificationResponse) -> Unit)? = null,
        onError: ((error: String) -> Unit)? = null,
        appearance: FootprintAppearance? = null
    ) {
        return FootprintHostedCommon.launchIdentify(
            PlatformContext(context),
            "com.onefootprint.android-onboarding-components",
            email,
            phone,
            onCancel,
            onAuthenticated,
            onError,
            appearance
        )
    }

    suspend fun handoff(
        context: Activity,
        onComplete: ((validationToken: String) -> Unit)? = null,
        onCancel: (() -> Unit)? = null,
        onError: ((error: String) -> Unit)? = null,
        appearance: FootprintAppearance? = null
    ) {
        return FootprintHostedCommon.handoff(
            PlatformContext(context),
            "com.onefootprint.android-onboarding-components",
            onComplete,
            onCancel,
            onError,
            appearance,
        )
    }
}