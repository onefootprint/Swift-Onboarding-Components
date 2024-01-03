package com.footprint.android
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.browser.customtabs.CustomTabsIntent

sealed class SessionResult {
    object Canceled : SessionResult()
    class Token(val value: String) : SessionResult()
    object Error : SessionResult()
}

internal class LauncherActivity : AppCompatActivity() {
    private val customTabsIntent = CustomTabsIntent.Builder().build()
    private var isCustomTabOpen = false

    private var config: FootprintConfig? = null
    private val footprint = FootprintAndroid.instance
    private var appPaused = false

    private fun handleResultFromUrl(url: String) {
        val result = parseResultFromUrl(url)
        when (result) {
            is SessionResult.Canceled -> config?.onCancel?.invoke()
            is SessionResult.Token -> config?.onComplete?.invoke(result.value)
            is SessionResult.Error -> config?.onError?.invoke("@onefootprint/footprint-android: Error parsing redirect URL.")
        }
        startDestinationActivity(result)
    }

    private fun parseResultFromUrl(url: String): SessionResult {
        val query = Uri.parse(url).query ?: return SessionResult.Error
        val queryParams = query.split("&")

        for (param in queryParams) {
            val (key, value) = param.split("=").let {
                if (it.size >= 2) it[0] to it[1] else it[0] to ""
            }

            when (key) {
                "canceled" -> return SessionResult.Canceled
                "validation_token" -> return SessionResult.Token(value)
            }
        }

        return SessionResult.Error
    }

    private fun handleError(error: String, shouldRedirect: Boolean = false) {
        config?.onError?.invoke("@onefootprint/footprint-android: $error")
        if (shouldRedirect) startDestinationActivity(SessionResult.Error)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        footprint.setLauncherActivityActive(true)
        config = footprint.getConfig()
        appPaused = false
        val verificationFlowUrl = intent.getStringExtra("VERIFICATION_FLOW_URL")

        intent?.data?.let { resultUrl ->
            handleResultFromUrl(resultUrl.toString())
        } ?: run {
            customTabsIntent.launchUrl(this, Uri.parse(verificationFlowUrl))
            isCustomTabOpen = true
        }
    }

    override fun onResume() {
        super.onResume()
        if (!isCustomTabOpen || !appPaused) {
            return
        }
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

    private fun startDestinationActivity(verificationResult: SessionResult) {
        config?.redirectActivityName?.let { redirectActivityName ->
            var intent: Intent? = null
            try {
                intent = Intent(
                    this,
                    Class.forName(redirectActivityName)
                )
                footprint.setLauncherActivityActive(false)
                intent.putExtra("verificationResult", verificationResult.toString())
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