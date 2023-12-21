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


internal enum class VerificationResult(val value: String){
    CLOSED("closed"),
    CANCELED("canceled")
}

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
    private var userData: FootprintUserData? = null
    private var options: FootprintOptions? = null
    private var onCompleteCallback: ((validationToken: String) -> Unit)? = null
    private var onCloseCallback: (() -> Unit)? = null
    private var onCancelCallback: (() -> Unit)? = null
    private val footprint = Footprint.getInstance()
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_launcher)
        footprint.setLauncherActivityActive(true)

        loadingIndicator = findViewById(R.id.loadingIndicator)
        errorIndicator = findViewById(R.id.errorIndicator)

        destinationActivityName = footprint.getDestinationActivityName()
        publicKey = footprint.getPublicKey()
        userData = footprint.getUserData()
        options = footprint.getOptions()
        onCompleteCallback = footprint.getOnCompleteCallback()
        onCloseCallback = footprint.getOnCloseCallback()
        onCancelCallback = footprint.getOnCancelCallback()

        val appIntent = intent;
        val resultUrl: Uri? = appIntent?.data
        if(resultUrl == null){
            if(publicKey != null && destinationActivityName != null) {
                loadingIndicator?.visibility = View.VISIBLE
                errorIndicator?.visibility = View.INVISIBLE
                launchVerification(this@LauncherActivity, publicKey!!, userData, options)
            }else{
                loadingIndicator?.visibility = View.INVISIBLE
                errorIndicator?.visibility = View.VISIBLE
            }
        }else{
            val result = parseResultUrl(resultUrl.toString())
            if(result == VerificationResult.CLOSED.value) onCloseCallback?.invoke()
            else if(result == VerificationResult.CANCELED.value) onCancelCallback?.invoke()
            else onCompleteCallback?.invoke(result)
            if(destinationActivityName != null) startDestinationActivity(destinationActivityName!!, result)
        }
    }

    override fun onResume() {
        super.onResume()
        if (mCustomTabsOpened) {
            // This means that the custom tabs have been closed by user clicking the close button on chrome (not our FE close button)
            // In this case, we send the user to the destination activity with a "close" result
            // TODO: call onClose
            mCustomTabsOpened = false
            onCloseCallback?.invoke()
            if(destinationActivityName != null) startDestinationActivity(destinationActivityName!!, VerificationResult.CLOSED.value)
        }
    }

    private fun getUrl(sdkToken: String): String {
        val baseUrl = "https://id.onefootprint.com"
        val redirectUrl = "${this.scheme}://${this.host}"
        return "$baseUrl/?redirect_url=$redirectUrl#$sdkToken"
    }

    private fun getSdkRequestBody(publicKey: String, userData: FootprintUserData? = null, options: FootprintOptions? = null): String {
        val kind = "verify_v1";
        val requestData = Data(publicKey = publicKey, userData = userData, options = options);
        val requestBody = SdkRequestData(kind =kind, data = requestData)
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

    private fun launchVerification(context: Context, publicKey: String, userData: FootprintUserData? = null, options: FootprintOptions? = null){
        val sdkRequestBody = getSdkRequestBody(publicKey = publicKey, userData = userData, options = options)
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
        if(key == VerificationResult.CANCELED.value || key == VerificationResult.CLOSED.value) {
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