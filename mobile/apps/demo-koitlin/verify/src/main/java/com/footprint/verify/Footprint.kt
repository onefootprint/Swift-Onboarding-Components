package com.footprint.verify

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.Call
import okhttp3.Callback
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okio.IOException
import java.lang.Exception
import kotlin.concurrent.Volatile

class Footprint private constructor() {
    private var destinationActivityName: String? = null
    private var publicKey: String? = null
    private var userData: FootprintUserData? = null
    private var options: FootprintOptions? = null
    private var launcherActivityActive = false
    private var onCompleteCallback: ((validationToken: String) -> Unit)? = null
    private var onCloseCallback: (() -> Unit)? = null
    private var onCancelCallback: (() -> Unit)? = null

    companion object {
        @Volatile
        private var instance: Footprint? = null

        fun getInstance(): Footprint {
            if (instance == null) {
                synchronized(this) {
                    if (instance == null) {
                        instance = Footprint()
                    }
                }
            }
            return instance!!
        }
    }

    fun setParams(
        destinationActivityName: String,
        publicKey: String,
        userData: FootprintUserData? = null,
        options: FootprintOptions? = null,
        onComplete: ((validationToken: String) -> Unit)? = null,
        onClose: (() -> Unit)? = null,
        onCancel: (() -> Unit)? = null
    ){
        this.destinationActivityName = destinationActivityName
        this.publicKey = publicKey
        this.userData = userData
        this.options = options
        this.onCompleteCallback = onComplete
        this.onCloseCallback = onClose
        this.onCancelCallback = onCancel
    }

    internal fun getDestinationActivityName(): String? {
        return this.destinationActivityName
    }

    internal fun getPublicKey(): String? {
        return this.publicKey
    }

    internal fun getUserData(): FootprintUserData? {
        return this.userData
    }

    internal fun getOptions(): FootprintOptions? {
        return this.options
    }

    internal fun getOnCompleteCallback(): ((String) -> Unit)? {
        return this.onCompleteCallback
    }

    internal fun getOnCloseCallback(): (() -> Unit)? {
        return this.onCloseCallback
    }

    internal fun getOnCancelCallback(): (() -> Unit)? {
        return this.onCancelCallback
    }

    internal fun setLauncherActivityActive(isActive: Boolean) {
        this.launcherActivityActive = isActive
    }

    fun startVerification(context: Context){
        if(launcherActivityActive) return // To avoid multiple clicks
        val hasPublicKey = publicKey != null && publicKey!!.isNotEmpty()
        val hasDestinationActivityName = destinationActivityName != null && destinationActivityName!!.isNotEmpty()

        if(!hasPublicKey || !hasDestinationActivityName){
            throw Exception(
                "Missing params:"+
                        (if(hasPublicKey) "" else " publicKey") +
                        (if(hasDestinationActivityName) "" else " destinationActivityName")
            )
        }

        val intent = Intent(context, LauncherActivity::class.java)
        context.startActivity(intent)
    }
}