package com.footprint.android

import FootprintLogger
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import okhttp3.OkHttpClient
import java.lang.Exception

// Keep a singleton HttpClient to use for performance reasons
internal object FootprintHttpClient {
    val client: OkHttpClient = OkHttpClient()
}

internal object FootprintSdkMetadata {
    const val bifrostBaseUrl: String = "https://id.onefootprint.com"
    const val apiBaseUrl: String = "https://api.onefootprint.com"
    const val name: String = "footprint-android"
    const val kind: String = "verify_v1"
    const val version: String = "1.0.0"
}
class FootprintAndroid private constructor() {
    private var config: FootprintConfiguration? = null
    private var context: Context? = null
    private var logger: FootprintLogger? = null
    private var attestationManager: FootprintAttestationManager? = null
    private var sdkArgsManager: FootprintSdkArgsManager? = null
    private var hasActiveSession = false
    companion object {
        internal val instance: FootprintAndroid by lazy { FootprintAndroid() }

        fun init(context: Context, config: FootprintConfiguration) {
            instance.apply {
                this.config = config
                this.context = context
                val logger = FootprintLogger(config)
                this.logger = logger
                this.sdkArgsManager = FootprintSdkArgsManager(config)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    this.attestationManager = FootprintAttestationManager(logger, context)
                }
            }.start()
        }
    }

    internal fun getConfig(): FootprintConfiguration? {
        return this.config
    }

    internal fun getLogger(): FootprintLogger? {
        return this.logger
    }

    internal fun getAttestationManager(): FootprintAttestationManager? {
        return this.attestationManager
    }

    internal fun setHasActiveSession(isActive: Boolean) {
        this.hasActiveSession = isActive
    }

    private fun validateConfig(): Boolean {
        config?.let { config ->
            val missingParams = mutableListOf<String>()
            if (config.publicKey.isNullOrEmpty() && config.authToken.isNullOrEmpty()) {
                missingParams.add("(publicKey or auth token)")
            }
            if (config.redirectActivityName.isNullOrEmpty()) {
                missingParams.add("redirectActivityName")
            }
            if (missingParams.isNotEmpty()) {
                logger?.logError("Missing params: ${missingParams.joinToString(" and ")}")
                return false
            }
            return true
        } ?: run {
            logger?.logError("No configuration found.")
            return false
        }
    }

    private fun getUrl(config: FootprintConfiguration, token: String): Uri? {
        try {
            val builder = Uri.parse(FootprintSdkMetadata.bifrostBaseUrl).buildUpon()
            builder.appendQueryParameter("redirect_url", "com.footprint.android://")
            val appearanceJson = config.appearance?.toJSON()
            appearanceJson?.let {
                it["fontSrc"]?.let { fontSrc -> builder.appendQueryParameter("font_src", fontSrc) }
                it["variant"]?.let { variant -> builder.appendQueryParameter("variant", variant) }
                it["variables"]?.let { variables -> builder.appendQueryParameter("variables", variables) }
                it["rules"]?.let { rules -> builder.appendQueryParameter("rules", rules) }
            }

            builder.fragment(token)
            return builder.build()
        } catch (error: Exception) {
            logger?.logError("Encountered error while building URL: $error")
            return null
        }
    }

    private fun handleSdkArgsToken(token: String?) {
        token?.let { innerToken ->
            val url = getUrl(config!!, innerToken)
            url?.let {
                val intent = Intent(context, LauncherActivity::class.java)
                intent.putExtra("FOOTPRINT_VERIFICATION_FLOW_URL", url.toString())
                context?.startActivity(intent)
            }
        } ?: run {
            logger?.logError("No SDK args token found while generating URL.")
        }
    }

    fun start() {
        // Prevents launching multiple verification flows at the same time
        if(hasActiveSession) return
        if(!validateConfig()) return
        setHasActiveSession(true)

        sdkArgsManager?.sendArgs(::handleSdkArgsToken) { error ->
            logger?.logError(error)
        }
    }
}