package com.footprint.verify

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity
import androidx.browser.customtabs.CustomTabsIntent
import androidx.constraintlayout.widget.ConstraintLayout
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
    private var loadingIndicator: ProgressBar? = null
    private var errorIndicator: ConstraintLayout? = null

    private val client = OkHttpClient()
    private val scheme = "com.footprint.verify.v1"
    private val host = "kyc"
    private val sdkName = "footprint-android 1.0.0"
    private val customTabsIntent = CustomTabsIntent.Builder().build()
    private var mCustomTabsOpened = false

    private var destinationActivityName: String? = null
    private var publicKey: String? = null
    private var authToken: String? = null
    private var userData: FootprintUserData? = null
    private var options: FootprintOptions? = null
    private var l10n: FootprintL10n? = null
    private var onComplete: ((validationToken: String) -> Unit)? = null
    private var onCancel: (() -> Unit)? = null
    private val footprint = Footprint.instance

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_launcher)
        footprint.setLauncherActivityActive(true)

        loadingIndicator = findViewById(R.id.loadingIndicator)
        errorIndicator = findViewById(R.id.errorIndicator)

        destinationActivityName = footprint.getDestinationActivityName()
        publicKey = footprint.getPublicKey()
        authToken = footprint.getAuthToken()
        userData = footprint.getUserData()
        options = footprint.getOptions()
        l10n = footprint.getL10n()
        onComplete = footprint.getOnComplete()
        onCancel = footprint.getOnCancel()

        val appIntent = intent;
        val resultUrl: Uri? = appIntent?.data
        if(resultUrl == null){
            if(publicKey != null && destinationActivityName != null) {
                loadingIndicator?.visibility = View.VISIBLE
                errorIndicator?.visibility = View.INVISIBLE
                launchVerification(this@LauncherActivity)
            }else{
                loadingIndicator?.visibility = View.INVISIBLE
                errorIndicator?.visibility = View.VISIBLE
            }
        }else{
            val result = parseResultUrl(resultUrl.toString())
            if(result == FootprintCanceledResultValue) onCancel?.invoke()
            else onComplete?.invoke(result)
            if(destinationActivityName != null) startDestinationActivity(destinationActivityName!!, result)
        }
    }

    override fun onResume() {
        super.onResume()
        if (mCustomTabsOpened) {
            // This means that the custom tabs have been closed by user clicking the close button on chrome (not our FE close button)
            // In this case, we send the user to the destination activity with a "cancel" result
            mCustomTabsOpened = false
            onCancel?.invoke()
            if(destinationActivityName != null) startDestinationActivity(destinationActivityName!!, FootprintCanceledResultValue)
        }
    }

    private fun getUrl(sdkToken: String): String {
        val baseUrl = "https://id.onefootprint.com"
        val redirectUrl = "${this.scheme}://${this.host}"
        return "$baseUrl/?redirect_url=$redirectUrl#$sdkToken"
    }

    private fun getSdkRequestBody(): String {
        val requestData = Data(publicKey = publicKey,
            authToken = authToken, userData = userData, options = options, l10n = l10n);
        val requestBody = SdkRequestData(kind = "verify_v1", data = requestData)
        val requestBodyString = Json.encodeToString(requestBody);
        return requestBodyString
    }

    private fun getSdkRequest(sdkRequestBody: String): Request {
        val endPoint = "https://api.onefootprint.com/org/sdk_args";
        return Request.Builder()
            .url(endPoint)
            .header("x-fp-client-version", this.sdkName)
            .header("Content-Type", "application/json")
            .post(sdkRequestBody.toRequestBody())
            .build();
    }

    fun launchVerification(context: Context){
        val sdkRequestBody = getSdkRequestBody()
        val sdkRequest = getSdkRequest(sdkRequestBody = sdkRequestBody)

        this.client.newCall(sdkRequest).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    loadingIndicator?.visibility = View.INVISIBLE
                    errorIndicator?.visibility = View.VISIBLE
                }
                // TODO: Send error to backend
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (!response.isSuccessful) {
                        runOnUiThread {
                            loadingIndicator?.visibility = View.INVISIBLE
                            errorIndicator?.visibility = View.VISIBLE
                        }
                        // TODO: Send error to backend
                        return
                    }
                    val responseBody = response.body!!.string();
                    val responseObject = Json.decodeFromString<SdkTokenResponse>(responseBody)
                    val sdkToken = responseObject.token
                    val url = getUrl(sdkToken = sdkToken)
                    customTabsIntent.launchUrl(context, Uri.parse(url))
                    mCustomTabsOpened = true
                }
            }
        })
    }

    private fun parseResultUrl(url: String): String {
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
            e.printStackTrace()
        }
    }

}