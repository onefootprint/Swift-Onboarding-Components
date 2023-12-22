package com.footprint.verify

import android.content.Context
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.RequestBody.Companion.toRequestBody
import okio.IOException
import kotlinx.serialization.encodeToString
import okhttp3.Call
import okhttp3.Callback
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response

@Serializable
internal data class FootprintSdkRequestData(
    val kind: String,
    val data: FootprintConfig
)

@Serializable
internal data class FootprintSdkTokenResponse(
    val token: String,
    @SerialName("expires_at") val expiresAt: String
)

class FootprintSdkArgsManager(private val config: FootprintConfig) {
    private val client = OkHttpClient()
    private val endpoint = "https://api.onefootprint.com/org/sdk_args"

    fun sendArgs(onSuccess: (String) -> Unit) {
        val sdkRequest = buildSdkRequest()
        client.newCall(sdkRequest).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                config.onError?.invoke("@onefootprint/footprint-kotlin: Saving SDK args request failed: ${e.localizedMessage}")
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (!it.isSuccessful) {
                        config.onError?.invoke("@onefootprint/footprint-kotlin: SDK Args request failed with status code: ${it.code}")
                        return
                    }
                    val responseBody = it.body?.string() ?: ""
                    val responseObject = Json.decodeFromString<FootprintSdkTokenResponse>(responseBody)
                    onSuccess(responseObject.token)
                }
            }
        })
    }

    private fun buildSdkRequest(): Request {
        val requestBody = FootprintSdkRequestData(kind = "verify_v1", data = config)
        return Request.Builder()
            .url(endpoint)
            .header("x-fp-client-version", "footprint-android verify 1.0.0")
            .header("Content-Type", "application/json")
            .post(Json.encodeToString(requestBody).toRequestBody())
            .build()
    }
}