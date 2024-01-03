package com.footprint.android

import android.content.Context
import android.content.Intent
import android.net.Uri

class FootprintAndroid private constructor() {
    private var config: FootprintConfig? = null
    private var launcherActivityActive = false
    companion object {
        internal val instance: FootprintAndroid by lazy { FootprintAndroid() }

        fun init(context: Context, config: FootprintConfig) {
            instance.apply {
                this.config = config
            }.start(context)
        }
    }

    internal fun getConfig(): FootprintConfig? {
        return this.config
    }
    internal fun setLauncherActivityActive(isActive: Boolean) {
        this.launcherActivityActive = isActive
    }

    private fun getTokenAndLaunchActivityForCustomTabs(context: Context) {
        config?.let { config ->
            val sdkArgsManager = FootprintSdkArgsManager(config)
            sdkArgsManager.sendArgs(onSuccess = {token ->
                val url = getUrl(config, token)
                val intent = Intent(context, LauncherActivity::class.java)
                intent.putExtra("VERIFICATION_FLOW_URL", url.toString())
                context.startActivity(intent)
            }, onError = { error ->
                config.onError?.invoke("@onefootprint/footprint-android: $error")
            })
        }
    }

    private fun getUrl(config: FootprintConfig, token: String): Uri? {
        val builder = Uri.parse("https://id.onefootprint.com").buildUpon()
        builder.appendQueryParameter("redirect_url", "com.footprint.android://")
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

    internal fun start(context: Context) {
        if(launcherActivityActive) return // To avoid multiple clicks
        config?.let { config ->
            val isMissingParam = config.publicKey.isNullOrEmpty() && config.authToken.isNullOrEmpty()
            val isMissingActivity = config.redirectActivityName.isNullOrEmpty()
            if(isMissingParam || isMissingActivity) {
                config.onError?.invoke("@onefootprint/footprint-android: Missing params: "+
                        (if(isMissingParam) "(publicKey or auth token)" else "") +
                        (if(isMissingParam && isMissingActivity) " and " else "") +
                        (if(isMissingActivity) "redirectActivityName" else ""))
            }
            getTokenAndLaunchActivityForCustomTabs(context)
        }
    }
}