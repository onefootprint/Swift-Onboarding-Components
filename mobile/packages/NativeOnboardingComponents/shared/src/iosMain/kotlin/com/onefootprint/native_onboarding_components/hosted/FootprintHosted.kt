package com.onefootprint.native_onboarding_components.hosted

import co.touchlab.skie.configuration.annotations.DefaultArgumentInterop
import platform.AuthenticationServices.ASWebAuthenticationSession
import platform.Foundation.NSURL
import com.onefootprint.native_onboarding_components.models.VerificationResponse
import platform.AuthenticationServices.ASWebAuthenticationPresentationContextProvidingProtocol
import platform.Foundation.NSError
import platform.UIKit.UIApplication
import platform.UIKit.UIWindow
import platform.darwin.NSObject

actual class PlatformContext()

internal actual fun getActivityClassName(context: PlatformContext): String {
    return "ONLY_REQUIRED_FOR_ANDROID"
}

class WebAuthPresentationContextProvider(private val window: UIWindow) : NSObject(),
    ASWebAuthenticationPresentationContextProvidingProtocol {
    override fun presentationAnchorForWebAuthenticationSession(session: ASWebAuthenticationSession): UIWindow {
        return window
    }
}

internal actual fun handleSdkArgsToken(
    config: FootprintConfiguration,
    context: PlatformContext,
    token: String
) {
    val url = FootprintHostedInternal.instance.getUrl(config, token)
    val callbackUrlScheme = config.scheme
    val window = UIApplication.sharedApplication.keyWindow

    val nsUrl = NSURL(string = url)

    val completionHandler: (NSURL?, NSError?) -> Unit = completionHandler@{ callbackUrl, error ->
        if (error?.code?.toInt() == 1) {
            config.onCancel?.invoke()
            return@completionHandler
        }
        if (error != null) {
            config.onError?.invoke(error.localizedDescription)
            return@completionHandler
        }
        when (val sessionResult =
            FootprintHostedInternal.instance.parseResultFromUrl(callbackUrl.toString())) {
            is SessionResult.Canceled -> {
                config.onCancel?.invoke()
            }

            is SessionResult.Complete -> {
                config.onComplete?.invoke(sessionResult.validationToken)
            }

            is SessionResult.OnAuthenticationComplete -> {
                config.onAuthenticationComplete?.invoke(
                    sessionResult.authToken,
                    sessionResult.vaultingToken
                )
            }

            is SessionResult.Error -> config.onError?.invoke("Error parsing redirect URL.")
        }
    }

    val authSession = ASWebAuthenticationSession(
        nsUrl,
        callbackUrlScheme,
        completionHandler
    )

    authSession.presentationContextProvider = WebAuthPresentationContextProvider(window!!)
    authSession.prefersEphemeralWebBrowserSession = true

    authSession.start()
}


object FootprintHosted {
    @DefaultArgumentInterop.Enabled
    suspend fun launchIdentify(
        email: String? = null,
        phone: String? = null,
        onAuthenticated: ((response: VerificationResponse) -> Unit),
        onCancel: (() -> Unit)? = null,
        onError: ((error: String) -> Unit)? = null,
        appearance: FootprintAppearance? = null
    ) {
        return FootprintHostedCommon.launchIdentify(
            PlatformContext(),
            "Footprint",
            email,
            phone,
            onCancel,
            onAuthenticated,
            onError,
            appearance
        )
    }
    @DefaultArgumentInterop.Enabled
    suspend fun handoff(
        onComplete: ((validationToken: String) -> Unit),
        onCancel: (() -> Unit)? = null,
        onError: ((error: String) -> Unit)? = null,
        appearance: FootprintAppearance? = null
    ) {
        return FootprintHostedCommon.handoff(
            PlatformContext(),
            "Footprint",
            onComplete,
            onCancel,
            onError,
            appearance,
        )
    }
}