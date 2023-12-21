package com.footprint.verify

import android.content.Context
import android.content.Intent
import java.lang.Exception

class Footprint private constructor() {
    private var destinationActivityName: String? = null
    private var publicKey: String? = null
    private var authToken: String? = null
    private var userData: FootprintUserData? = null
    private var options: FootprintOptions? = null
    private var l10n: FootprintL10n? = null
    private var launcherActivityActive = false
    private var onComplete: ((validationToken: String) -> Unit)? = null
    private var onCancel: (() -> Unit)? = null

    companion object {
        val instance: Footprint by lazy { Footprint() }

        fun init(context: Context, config: FootprintConfig) {
            instance.apply {
                destinationActivityName = config.destinationActivityName
                publicKey = config.publicKey
                authToken = config.authToken
                userData = config.userData
                options = config.options
                l10n = config.l10n
                onComplete = config.onComplete
                onCancel = config.onCancel
            }.startVerification(context)
        }
    }

    internal fun getDestinationActivityName(): String? {
        return this.destinationActivityName
    }

    internal fun getPublicKey(): String? {
        return this.publicKey
    }

    internal fun getAuthToken(): String? {
        return this.authToken
    }

    internal fun getUserData(): FootprintUserData? {
        return this.userData
    }

    internal fun getOptions(): FootprintOptions? {
        return this.options
    }

    internal fun getL10n(): FootprintL10n? {
        return this.l10n
    }

    internal fun getOnComplete(): ((String) -> Unit)? {
        return this.onComplete
    }

    internal fun getOnCancel(): (() -> Unit)? {
        return this.onCancel
    }

    internal fun setLauncherActivityActive(isActive: Boolean) {
        this.launcherActivityActive = isActive
    }

    fun startVerification(context: Context){
        if(launcherActivityActive) return // To avoid multiple clicks
        val hasPublicKey = publicKey != null && publicKey!!.isNotEmpty()
        val hasAuthToken = authToken != null && authToken!!.isNotEmpty()
        val isMissingParam = !hasPublicKey && !hasAuthToken
        val hasDestinationActivityName = destinationActivityName != null && destinationActivityName!!.isNotEmpty()

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