package com.footprint.verify

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
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


internal const val FootprintCanceledResultValue = "canceled"

internal class LauncherActivity : AppCompatActivity() {
    private val client = OkHttpClient()
    private val scheme = "com.footprint.verify.v1"
    private val host = "kyc"
    private val customTabsIntent = CustomTabsIntent.Builder().build()
    private var isCustomTabOpen = false

    private var config: FootprintConfig? = null
    private val footprint = Footprint.instance

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_launcher)
        footprint.setLauncherActivityActive(true)
        config = footprint.getConfig()

        val appIntent = intent;
        val resultUrl: Uri? = appIntent?.data
        if(resultUrl == null) {
            if(config?.publicKey != null && config?.destinationActivityName != null) {
                launchVerification(this@LauncherActivity)
            } else {
                config?.onError?.invoke("Something went wrong") // TODO: better error message
            }
        } else {
            val result = parseResultUrl(resultUrl.toString())
            if(result == FootprintCanceledResultValue) {
                config?.onCancel?.invoke()
            } else {
                config?.onComplete?.invoke(result)
            }

            if(config?.destinationActivityName != null) {
                startDestinationActivity(config?.destinationActivityName!!, result)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        if (isCustomTabOpen) {
            // This means that the custom tabs have been closed by user clicking the close button
            // on chrome (not our FE close button). In this case, we send the user to the destination
            // activity and call the onCancel callback
            isCustomTabOpen = false
            config?.onCancel?.invoke()
            if(config?.destinationActivityName != null) {
                startDestinationActivity(
                    config?.destinationActivityName!!,
                    FootprintCanceledResultValue
                )
            }
        }
    }

    private fun getUrl(sdkToken: String): Uri {
        val baseUrl = "https://id.onefootprint.com"
        val redirectUrl = "${this.scheme}://${this.host}"
        return Uri.parse("$baseUrl/?redirect_url=$redirectUrl#$sdkToken")
    }
    private fun getSdkRequest(): Request? {
        val requestData = config?.toData()
        if (requestData == null) {
            return null // TODO: handle
        }
        val requestBody = SdkRequestData(kind = "verify_v1", data = requestData)
        val endpoint = "https://api.onefootprint.com/org/sdk_args";
        return Request.Builder()
            .url(endpoint)
            .header("x-fp-client-version", "footprint-android verify 1.0.0")
            .header("Content-Type", "application/json")
            .post(Json.encodeToString(requestBody).toRequestBody())
            .build();
    }

    fun launchVerification(context: Context){
        val sdkRequest = getSdkRequest()
        if (sdkRequest == null) {
            return // TODO: handle
        }

        this.client.newCall(sdkRequest).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                config?.onError?.invoke("Something went wrong 3") // TODO: better error message
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (!it.isSuccessful) {
                        config?.onError?.invoke("Something went wrong 2") // TODO: better error message
                        return
                    }
                    val responseBody = it.body!!.string(); // TODO: handle error
                    val responseObject = Json.decodeFromString<SdkTokenResponse>(responseBody)
                    val sdkToken = responseObject.token
                    val url = getUrl(sdkToken = sdkToken)
                    customTabsIntent.launchUrl(context, url)
                    isCustomTabOpen = true
                }
            }
        })
    }

    private fun parseResultUrl(url: String): String {
        // TODO: better URL parsing here
        // Risky operations because we are assuming the URL structure from our knowledge of how we defined them in the FE
        val params = url.split("?")[1]
        val key = params.split("=")[0]
        val value = params.split("=")[1]
        if(key == FootprintCanceledResultValue) {
            return key
        }
        return value // The value is essentially the token here
    }

    private fun startDestinationActivity(destinationActivityName: String, verificationResult: String){
        var intent: Intent? = null
        try {
            intent = Intent(
                this,
                Class.forName(destinationActivityName)
            )
            footprint.setLauncherActivityActive(false)
            intent.putExtra("verificationResult", verificationResult)
            startActivity(intent)
            finish() // Important cause we don't want the user to be able to come back to our activity on backspace
        } catch (e: ClassNotFoundException) {
            e.localizedMessage?.let {
                config?.onError?.invoke(it)
            } ?: run {
                config?.onError?.invoke("Something went wrong") // TODO:
            }
        }
    }

}