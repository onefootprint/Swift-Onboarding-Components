package com.footprint.android

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.RequestBody.Companion.toRequestBody
import okio.IOException
import kotlinx.serialization.encodeToString
import okhttp3.Call
import okhttp3.Callback
import okhttp3.Request
import okhttp3.Response
import java.lang.Exception

@Serializable
internal data class FootprintSdkRequestData(
    val kind: String,
    val data: FootprintConfiguration
)

@Serializable
internal data class FootprintSdkTokenResponse(
    val token: String,
    @SerialName("expires_at") val expiresAt: String
)

class FootprintSdkArgsManager(private val config: FootprintConfiguration) {
    fun sendArgs(onSuccess: (String?) -> Unit, onError: (String) -> Unit) {
        val sdkRequest = buildSdkRequest()
        FootprintHttpClient.client.newCall(sdkRequest).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                onError(e.toString())
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (!it.isSuccessful) {
                        onError("SDK Args request failed with ${it.code} ${it.body.toString()}")
                        return
                    }
                    try {
                        val responseBody = it.body?.string() ?: ""
                        val responseObject = Json.decodeFromString<FootprintSdkTokenResponse>(responseBody)
                        onSuccess(responseObject.token)
                    } catch (e: Exception) {
                        onError("Parsing SDK Args response failed. $e")
                    }

                }
            }
        })
    }

    private fun buildSdkRequest(): Request {
        val requestBody = FootprintSdkRequestData(
            kind = FootprintSdkMetadata.kind,
            data = config
        )
        return Request.Builder()
            .url("${FootprintSdkMetadata.apiBaseUrl}/org/sdk_args")
            .header("x-fp-client-version", "${FootprintSdkMetadata.name} ${FootprintSdkMetadata.version}")
            .header("Content-Type", "application/json")
            .post(Json.encodeToString(requestBody).toRequestBody())
            .build()
    }
}