package com.onefootprint.native_onboarding_components.hosted

import FootprintErrorManager
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.browser.customtabs.CustomTabsIntent
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import java.lang.Exception

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
    private var config: FootprintConfiguration? = null
    private var errorManager: FootprintErrorManager? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        footprint.setHasActiveSession(true)
        config = footprint.getConfig()
        errorManager = footprint.getErrorManager()
        appPaused = false

        intent.data?.let { resultUrl ->
            // Launch a coroutine to call the suspend function
            lifecycleScope.launch {
                handleResultFromUrl(resultUrl.toString())
            }
        } ?: run {
            lifecycleScope.launch {
                getVerificationUrl()?.let { url ->
                    customTabsIntent.launchUrl(this@HostedLauncherActivity, url)
                    isCustomTabOpen = true
                }
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

    private suspend fun getVerificationUrl(): Uri? {
        val verificationFlowUrl = intent.getStringExtra("FOOTPRINT_VERIFICATION_FLOW_URL")
        return try {
            Uri.parse(verificationFlowUrl)
        } catch (error: Exception) {
            handleError(error.toString())
            null
        }
    }

    private suspend fun handleResultFromUrl(url: String) {
        when (val sessionResult = FootprintHostedInternal.instance.parseResultFromUrl(url)) {
            is SessionResult.Canceled -> {
                config?.onCancel?.invoke()
                startDestinationActivity(VerificationStatus.Canceled)
            }

            is SessionResult.Complete -> {
                config?.onComplete?.invoke(sessionResult.validationToken)
                startDestinationActivity(VerificationStatus.Success(sessionResult.validationToken))
            }

            is SessionResult.OnAuthenticationComplete -> {
                val validationToken = config?.onAuthenticationComplete?.invoke(
                    sessionResult.authToken,
                    sessionResult.vaultingToken
                )
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


    private suspend fun handleError(error: String, shouldRedirect: Boolean = false) {
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
                lifecycleScope.launch {
                    e.localizedMessage?.let {
                        handleError(it)
                    } ?: run {
                        handleError("Unable to start the redirect activity - Class Not Found.")
                    }
                }
            }
        }
    }

}