package com.footprint.kotlin

import android.content.Context
import android.content.Intent
import java.lang.Exception

class FootprintKotlin private constructor() {
    private var config: FootprintConfig? = null
    private var launcherActivityActive = false
    companion object {
        internal val instance: FootprintKotlin by lazy { FootprintKotlin() }

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
                config.onError?.invoke("@onefootprint/footprint-kotlin: Missing params:"+
                        (if(isMissingParam) "" else " (publicKey or auth token)") +
                        (if(isMissingActivity) "" else " redirectActivityName"))
            }

            val intent = Intent(context, LauncherActivity::class.java)
            context.startActivity(intent)
        }
    }
}