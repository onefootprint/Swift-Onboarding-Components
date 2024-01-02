package com.footprint.android

import android.content.Context
import android.content.Intent

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

    fun start(context: Context) {
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

            val intent = Intent(context, LauncherActivity::class.java)
            context.startActivity(intent)
        }
    }
}