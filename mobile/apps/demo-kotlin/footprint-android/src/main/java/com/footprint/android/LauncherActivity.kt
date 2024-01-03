package com.footprint.android
import FootprintErrorManager
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.browser.customtabs.CustomTabsIntent
import java.lang.Exception

sealed class SessionResult {
    object Canceled : SessionResult()
    class Complete(val validationToken: String) : SessionResult()
    object Error : SessionResult()
}

internal class LauncherActivity : AppCompatActivity() {
    private val customTabsIntent = CustomTabsIntent.Builder().build()
    private val footprint = FootprintAndroid.instance
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
        startDestinationActivity(SessionResult.Canceled)
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
        val result = parseResultFromUrl(url)
        when (result) {
            is SessionResult.Canceled -> config?.onCancel?.invoke()
            is SessionResult.Complete -> config?.onComplete?.invoke(result.validationToken)
            is SessionResult.Error -> handleError("Error parsing redirect URL.")
        }
        startDestinationActivity(result)
    }

    private fun parseResultFromUrl(url: String): SessionResult {
        try {
            val query = Uri.parse(url).query ?: return SessionResult.Error
            val queryParams = query.split("&")
            for (param in queryParams) {
                val (key, value) = param.split("=").let {
                    if (it.size >= 2) it[0] to it[1] else it[0] to ""
                }
                when (key) {
                    "canceled" -> return SessionResult.Canceled
                    "validation_token" -> return SessionResult.Complete(value)
                }
            }
            return SessionResult.Error
        } catch (e: Exception) {
            return SessionResult.Error
        }
    }
    private fun handleError(error: String, shouldRedirect: Boolean = false) {
        errorManager?.log(error)
        if (shouldRedirect) startDestinationActivity(SessionResult.Error)
    }

    private fun startDestinationActivity(verificationResult: SessionResult) {
        config?.redirectActivityName?.let { redirectActivityName ->
            var intent: Intent? = null
            try {
                intent = Intent(
                    this,
                    Class.forName(redirectActivityName)
                )
                footprint.setHasActiveSession(false)
                intent.putExtra("FOOTPRINT_VERIFICATION_RESULT", verificationResult.toString())
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