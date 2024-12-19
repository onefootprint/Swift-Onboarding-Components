import com.onefootprint.native_onboarding_components.FootprintQueries
import com.onefootprint.native_onboarding_components.getPackage
import com.onefootprint.native_onboarding_components.hosted.FootprintConfiguration
import com.onefootprint.native_onboarding_components.hosted.FootprintSdkMetadata
import org.openapitools.client.models.LogBody


internal class FootprintErrorManager(private val configuration: FootprintConfiguration) {
    private val debugMode = false // Enable this for local development

    private fun getErrorMsg(error: String): String {
        return "${getPackage().name} ${getPackage().version}: $error"
    }

    suspend fun log(error: String) {
        val errorMsg = getErrorMsg(error)
        if (debugMode) {
            println("> FootprintAndroidDebug $errorMsg")
        } else {
            sendErrorLog(
                error = error,
                sdkKind = FootprintSdkMetadata.kindVerify
            )
        }
        configuration.onError?.invoke(errorMsg)
    }

    private suspend fun sendErrorLog(error: String, sdkKind: String) {
        try {
            FootprintQueries.sendTelemetry(
                LogBody(
                    tenantDomain = configuration.redirectActivityName,
                    sdkKind = sdkKind,
                    sdkName = getPackage().name,
                    sdkVersion = getPackage().version,
                    logLevel = "error",
                    logMessage = error,
                )
            )
        } catch (e: Exception) {
            // Do nothing
        }
    }
}


