package com.onefootprint.native_onboarding_components.hosted
import FootprintErrorManager
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.browser.customtabs.CustomTabsIntent
import java.lang.Exception

internal sealed class SessionResult {
    data object Canceled : SessionResult()
    class Complete(val validationToken: String) : SessionResult()
    class OnAuthenticationComplete(val authToken: String, val vaultingToken: String): SessionResult()
    data object Error : SessionResult()
}

sealed class VerificationStatus {
    data class Success(val validationToken: String) : VerificationStatus() {
        override fun toString(): String {
            return "validation_token=$validationToken"
        }
    }

    object Error : VerificationStatus() {
        override fun toString(): String {
            return "error"
        }
    }

    object Canceled : VerificationStatus() {
        override fun toString(): String {
            return "canceled"
        }
    }
}

internal class HostedLauncherActivity : ComponentActivity() {
    private val customTabsIntent = CustomTabsIntent.Builder().build()
    private val footprint = FootprintHostedInternal.instance
    private var isCustomTabOpen = false
    private var appPaused = false
    private var sdkArgsManager: FootprintSdkArgsManager? = null
    private var config: FootprintConfiguration? = null
    private var errorManager: FootprintErrorManager? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        footprint.setHasActiveSession(true)
        config = footprint.getConfig()
        errorManager = footprint.getErrorManager()
        sdkArgsManager = config?.let { FootprintSdkArgsManager(it) }
        appPaused = false
        intent.data?.let { resultUrl ->
            handleResultFromUrl(resultUrl.toString())
        } ?: run {
            getVerificationUrl()?.let { url ->
                customTabsIntent.launchUrl(this, url)
                isCustomTabOpen = true
            }
        }
    }

    override fun onResume() {
        super.onResume()
        if (!isCustomTabOpen || !appPaused) return
        // This means that the custom tabs have been closed by user clicking the close button
        // on chrome (not our FE close button). In this case, we send the user to the destination
        // activity and call the onCancel callback
        isCustomTabOpen = false
        config?.onCancel?.invoke()
        startDestinationActivity(VerificationStatus.Canceled)
    }

    override fun onPause() {
        super.onPause()
        appPaused = true
    }

    private fun getVerificationUrl(): Uri? {
        val verificationFlowUrl = intent.getStringExtra("FOOTPRINT_VERIFICATION_FLOW_URL")
        return try {
            Uri.parse(verificationFlowUrl)
        } catch (error: Exception) {
            handleError(error.toString())
            null
        }
    }

    private fun handleResultFromUrl(url: String) {
        when (val sessionResult = parseResultFromUrl(url)) {
            is SessionResult.Canceled -> {
                config?.onCancel?.invoke()
                startDestinationActivity(VerificationStatus.Canceled)
            }
            is SessionResult.Complete -> {
                config?.onComplete?.invoke(sessionResult.validationToken)
                startDestinationActivity(VerificationStatus.Success(sessionResult.validationToken))
            }
            is SessionResult.OnAuthenticationComplete -> {
                val validationToken = config?.onAuthenticationComplete?.invoke(sessionResult.authToken, sessionResult.vaultingToken)
                if (validationToken != null) {
                    startDestinationActivity(VerificationStatus.Success(validationToken))
                } else {
                    // Handle the error if validationToken is null
                    handleError("Error: Validation token is null.")
                }
            }
            is SessionResult.Error -> handleError("Error parsing redirect URL.")
        }
    }

    private fun parseResultFromUrl(url: String): SessionResult {
        try {
            val query = Uri.parse(url).query ?: return SessionResult.Error
            val queryParams = query.split("&")
            var authTokenFromUrl: String? = null
            var vaultingTokenFromUrl: String? = null
            for (param in queryParams) {
                val (key, value) = param.split("=").let {
                    if (it.size >= 2) it[0] to it[1] else it[0] to ""
                }
                when (key) {
                    "canceled" -> return SessionResult.Canceled
                    "validation_token" -> return SessionResult.Complete(value)
                    "auth_token" -> authTokenFromUrl = value
                    "components_vault_token" -> vaultingTokenFromUrl = value
                }
            }
            if (authTokenFromUrl != null && vaultingTokenFromUrl != null){
                return SessionResult.OnAuthenticationComplete(authToken = authTokenFromUrl, vaultingToken = vaultingTokenFromUrl)
            }
            return SessionResult.Error
        } catch (e: Exception) {
            return SessionResult.Error
        }
    }
    private fun handleError(error: String, shouldRedirect: Boolean = false) {
        errorManager?.log(error)
        if (shouldRedirect) startDestinationActivity(VerificationStatus.Error)
    }

    private fun startDestinationActivity(verificationResult: VerificationStatus) {
        config?.redirectActivityName?.let { redirectActivityName ->
            var intent: Intent? = null
            try {
                intent = Intent(
                    this,
                    Class.forName(redirectActivityName)
                )
                footprint.setHasActiveSession(false)
                intent.putExtra("FOOTPRINT_VERIFICATION_RESULT", verificationResult.toString())
                intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
                startActivity(intent)
                finish() // Important cause we don't want the user to be able to come back to our activity on backspace
            } catch (e: ClassNotFoundException) {
                e.localizedMessage?.let {
                    handleError(it)
                } ?: run {
                    handleError("Unable to start the redirect activity - Class Not Found.")
                }
            }
        }
    }

}