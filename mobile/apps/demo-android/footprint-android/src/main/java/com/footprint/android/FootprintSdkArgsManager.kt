package com.footprint.android

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.Call
import okhttp3.Callback
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okio.IOException

@Serializable
private data class FootprintSdkRequestData(
    val kind: String,
    val data: FootprintConfiguration?,
    val result: FootprintSessionResult?
)

@Serializable
internal data class FootprintSessionResultArgsData(
    @SerialName("device_response") val deviceResponse: String,
    @SerialName("auth_token") val authToken: String,
)

@Serializable
internal data class FootprintSessionResultArgs(
    val kind: String,
    val data: FootprintSessionResultArgsData
)

@Serializable
internal data class FootprintSessionResult(
    val args: FootprintSessionResultArgs,
)

@Serializable
internal data class FetchArgsResult(
    val result: FootprintSessionResult?,
    val error: String?
)

@Serializable
private data class FootprintSdkTokenResponse(
    val token: String,
    @SerialName("expires_at") val expiresAt: String
)

internal class FootprintSdkArgsManager(private val config: FootprintConfiguration) {
    fun fetchArgs(sdkArgsToken: String, onComplete: (FetchArgsResult) -> Unit) {
        val sdkRequest = buildFetchSdkArgsRequest(sdkArgsToken)
        FootprintHttpClient.client.newCall(sdkRequest).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                onComplete(FetchArgsResult(error = e.toString(), result = null))
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (!it.isSuccessful) {
                        onComplete(
                            FetchArgsResult(
                                error = "Fetching SDK args failed with ${it.code} ${it.body.toString()}",
                                result = null
                            )
                        )
                        return
                    }
                    try {
                        val responseBody = it.body?.string() ?: ""
                        val json = Json { ignoreUnknownKeys = true }
                        val res =
                            json.decodeFromString<FootprintSessionResult>(responseBody)
                        onComplete(FetchArgsResult(result = res, error = null))
                    } catch (e: Exception) {
                        onComplete(
                            FetchArgsResult(
                                error = "Parsing fetch SDK args response failed. $e",
                                result = null
                            )
                        )
                    }
                }
            }
        })
    }

    fun sendArgs(onSuccess: (String?) -> Unit, onError: (String) -> Unit) {
        val sdkRequest = buildSendSdkArgsRequest()
        FootprintHttpClient.client.newCall(sdkRequest).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                onError(e.toString())
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (!it.isSuccessful) {
                        onError("Sending SDK args failed with ${it.code} ${it.body.toString()}")
                        return
                    }
                    try {
                        val responseBody = it.body?.string() ?: ""
                        val token =
                            Json.decodeFromString<FootprintSdkTokenResponse>(responseBody).token
                        onSuccess(token)
                    } catch (e: Exception) {
                        onError("Parsing send SDK args response failed. $e")
                    }
                }
            }
        })
    }

    private fun buildSendSdkArgsRequest(): Request {
        val requestBody = FootprintSdkRequestData(
            kind = FootprintSdkMetadata.kind,
            data = config,
            result = null
        )
        return Request.Builder()
            .url("${FootprintSdkMetadata.apiBaseUrl}/org/sdk_args")
            .header(
                "x-fp-client-version",
                "${FootprintSdkMetadata.name} ${FootprintSdkMetadata.version}"
            )
            .header("Content-Type", "application/json")
            .post(Json.encodeToString(requestBody).toRequestBody())
            .build()
    }

    private fun buildFetchSdkArgsRequest(sdkArgsToken: String): Request {
        return Request.Builder()
            .url("${FootprintSdkMetadata.apiBaseUrl}/org/sdk_args")
            .header(
                "x-fp-client-version",
                "${FootprintSdkMetadata.name} ${FootprintSdkMetadata.version}"
            )
            .header(
                "x-fp-sdk-args-token",
                sdkArgsToken
            )
            .header("Content-Type", "application/json")
            .get()
            .build()
    }
}