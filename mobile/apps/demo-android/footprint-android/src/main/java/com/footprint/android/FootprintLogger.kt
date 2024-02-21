import android.util.Log
import com.footprint.android.FootprintConfiguration
import com.footprint.android.FootprintHttpClient
import com.footprint.android.FootprintSdkMetadata
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.Call
import okhttp3.Callback
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import java.io.IOException
import java.lang.Exception

@Serializable
internal data class FootprintSdkTelemetry(
    @SerialName("tenant_domain") val tenantDomain: String? = null,
    @SerialName("sdk_kind") val sdkKind: String? = null,
    @SerialName("sdk_name") val sdkName: String? = null,
    @SerialName("sdk_version") val sdkVersion: String? = null,
    @SerialName("log_level") val logLevel: String? = null,
    @SerialName("log_message") val logMessage: String? = null,
    @SerialName("session_id") val sessionId: String? = null,
)

internal class FootprintLogger(private val configuration: FootprintConfiguration) {
    private val debugMode = false // Enable this for local development

    private fun getMessage(raw: String): String {
        return "@onefootprint/footprint-android: $raw"
    }

    fun logError(error: String) {
        val errorMsg = getMessage(error)
        if (debugMode) {
            Log.d("FootprintAndroidDebug", errorMsg)
        } else {
            sendLog(error, "error")
        }
        configuration.onError?.invoke(errorMsg)
    }

    fun logWarn(warn: String) {
        val warnMsg = getMessage(warn)
        if (debugMode) {
            Log.d("FootprintAndroidDebug", warnMsg)
        } else {
            sendLog(warnMsg, "warn")
        }
    }

    private fun sendLog(message: String, level: String) {
        try {
            val requestBody = FootprintSdkTelemetry(
                tenantDomain = configuration.redirectActivityName,
                sdkKind = FootprintSdkMetadata.kind,
                sdkName = FootprintSdkMetadata.name,
                sdkVersion = FootprintSdkMetadata.version,
                logLevel = level,
                logMessage = message,
            )
            val request = Request.Builder()
                .url("${FootprintSdkMetadata.apiBaseUrl}/org/sdk_telemetry")
                .header("Content-Type", "application/json")
                .post(Json.encodeToString(requestBody).toRequestBody())
                .build()

            FootprintHttpClient.client.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) { /* Fire and forget */ }
                override fun onResponse(call: Call, response: Response) { /* Fire and forget */ }
            })
        } catch (e: Exception) {
            // Do nothing
        }
    }
}


