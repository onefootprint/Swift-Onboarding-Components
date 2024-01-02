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

    fun start(context: Context){
        if(launcherActivityActive) return // To avoid multiple clicks
        val hasPublicKey = config?.publicKey != null && config?.publicKey!!.isNotEmpty()
        val hasAuthToken = config?.authToken != null && config?.authToken!!.isNotEmpty()
        val isMissingParam = !hasPublicKey && !hasAuthToken
        val hasDestinationActivityName = config?.destinationActivityName != null &&
                config?.destinationActivityName!!.isNotEmpty()

        if(isMissingParam || !hasDestinationActivityName){
            throw Exception(
                "Missing params:"+
                        (if(isMissingParam) "" else " (publicKey or auth token)") +
                        (if(hasDestinationActivityName) "" else " destinationActivityName")
            )
        }

        val intent = Intent(context, LauncherActivity::class.java)
        context.startActivity(intent)
    }
}