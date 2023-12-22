package com.footprint.verify
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
    private val footprint = Footprint.instance

    private fun handleResultFromUrl(url: String) {
        val result = parseResultFromUrl(url)
        when (result) {
            is SessionResult.Canceled -> config?.onCancel?.invoke()
            is SessionResult.Token -> config?.onComplete?.invoke(result.value)
            is SessionResult.Error -> config?.onError?.invoke("@onefootprint/footprint-kotlin: Error parsing redirect URL.")
        }

        config?.destinationActivityName?.let { startDestinationActivity(it, result) }
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

    private fun launchVerificationIfReady() {
        config?.let { outerConfig ->
            outerConfig.destinationActivityName?.let {
                val sdkArgsManager = FootprintSdkArgsManager(outerConfig)
                sdkArgsManager.sendArgs { sdkToken ->
                    val url = getUrl(outerConfig, sdkToken)
                    url?.let {
                        customTabsIntent.launchUrl(this, url)
                        isCustomTabOpen = true
                    } ?: run {
                        config?.onError?.invoke("@onefootprint/footprint-kotlin: Encountered error while generating URL.")
                    }
                }
            } ?: run {
                config?.onError?.invoke("@onefootprint/footprint-kotlin: Required destinationActivityName missing.")
            }
        } ?: run {
            config?.onError?.invoke("@onefootprint/footprint-kotlin: Required configuration missing.")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        footprint.setLauncherActivityActive(true)
        config = footprint.getConfig()

        intent?.data?.let { resultUrl ->
            handleResultFromUrl(resultUrl.toString())
        } ?: run {
            launchVerificationIfReady()
        }
    }

    override fun onResume() {
        super.onResume()
        if (!isCustomTabOpen) {
            return;
        }
        // This means that the custom tabs have been closed by user clicking the close button
        // on chrome (not our FE close button). In this case, we send the user to the destination
        // activity and call the onCancel callback
        isCustomTabOpen = false
        config?.onCancel?.invoke()
        config?.destinationActivityName?.let { destinationActivityName ->
            startDestinationActivity(
                destinationActivityName,
                SessionResult.Canceled
            )
        }
    }

    private fun getUrl(config: FootprintConfig, token: String): Uri? {
        val bifrostBaseUrl = "https://id.onefootprint.com"
        val builder = Uri.parse(bifrostBaseUrl).buildUpon()
        builder.appendQueryParameter("redirect_url", "com.footprint://")
        val appearanceJson = config.appearance?.toJSON()
        appearanceJson?.let {
            it["fontSrc"]?.let { fontSrc -> builder.appendQueryParameter("fontSrc", fontSrc) }
            it["variant"]?.let { variant -> builder.appendQueryParameter("variant", variant) }
            it["variables"]?.let { variables -> builder.appendQueryParameter("variables", variables) }
            it["rules"]?.let { rules -> builder.appendQueryParameter("rules", rules) }
        }

        builder.fragment(token)
        return builder.build()
    }

    private fun startDestinationActivity(destinationActivityName: String, verificationResult: SessionResult){
        var intent: Intent? = null
        try {
            intent = Intent(
                this,
                Class.forName(destinationActivityName)
            )
            footprint.setLauncherActivityActive(false)
            intent.putExtra("verificationResult", verificationResult.toString())
            startActivity(intent)
            finish() // Important cause we don't want the user to be able to come back to our activity on backspace
        } catch (e: ClassNotFoundException) {
            e.localizedMessage?.let {
                config?.onError?.invoke("@onefootprint/footprint-kotlin: $it")
            } ?: run {
                config?.onError?.invoke("@onefootprint/footprint-kotlin: Unable to start intent.")
            }
        }
    }

}