package com.onefootprint.native_onboarding_components.hosted

import FootprintErrorManager
import com.onefootprint.native_onboarding_components.FootprintQueries
import io.ktor.http.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.openapitools.client.models.L10nV1
import org.openapitools.client.models.SdkArgs
import org.openapitools.client.models.VerifyV1Options
import org.openapitools.client.models.VerifyV1SdkArgs
import kotlin.Exception

internal object FootprintSdkMetadata {
    const val bifrostBaseUrl: String = "id.onefootprint.com"
    const val kindVerify: String = "verify_v1"
}

internal expect fun handleSdkArgsToken(
    config: FootprintConfiguration,
    context: PlatformContext,
    token: String
)

internal class FootprintHostedInternal private constructor() {
    private lateinit var config: FootprintConfiguration
    private lateinit var context: PlatformContext
    private lateinit var errorManager: FootprintErrorManager
    private var hasActiveSession = false

    companion object {
        internal val instance: FootprintHostedInternal by lazy { FootprintHostedInternal() }

        suspend fun init(context: PlatformContext, config: FootprintConfiguration) {
            instance.apply {
                this.config = config
                this.context = context
                this.errorManager = FootprintErrorManager(config)
            }.start()
        }
    }

    internal fun getConfig(): FootprintConfiguration {
        return this.config
    }

    internal fun getErrorManager(): FootprintErrorManager {
        return this.errorManager
    }

    internal fun setHasActiveSession(isActive: Boolean) {
        this.hasActiveSession = isActive
    }

    private suspend fun validateConfig(): Boolean {
        val missingParams = mutableListOf<String>()
        if (config.publicKey.isNullOrEmpty() && config.authToken.isNullOrEmpty()) {
            missingParams.add("(publicKey or auth token)")
        }
        if (config.redirectActivityName.isNullOrEmpty()) {
            missingParams.add("redirectActivityName")
        }
        if (missingParams.isNotEmpty()) {
            errorManager.log("Missing params: ${missingParams.joinToString(" and ")}")
            return false
        }
        return true
    }

    fun getUrl(config: FootprintConfiguration, token: String): String {
        val appearanceJson = config.appearance?.toJSON()
        val language = config.l10n?.language

        val url = URLBuilder().apply {
            protocol = URLProtocol.HTTPS
            // TODO add support for kind auth
            host = FootprintSdkMetadata.bifrostBaseUrl
            // Adding query parameters
            parameters.append(
                "redirect_url",
                "com.onefootprint.android-onboarding-components://"
            )
            if (!config.sessionId.isNullOrEmpty()) parameters.append(
                "xfpsessionid",
                config.sessionId
            )
            language?.let {
                parameters.append("lng", Json.encodeToString(it).replace("\"", ""))
            }
            // Append appearance-related query parameters
            appearanceJson?.let {
                it["fontSrc"]?.let { fontSrc -> parameters.append("font_src", fontSrc) }
                it["variant"]?.let { variant -> parameters.append("variant", variant) }
                it["variables"]?.let { variables -> parameters.append("variables", variables) }
                it["rules"]?.let { rules -> parameters.append("rules", rules) }
            }

            // Add fragment token
            fragment = token
        }.build()

        return url.toString()

    }

    internal suspend fun start() {
        // Prevents launching multiple verification flows at the same time
        if (hasActiveSession) {
            return
        }
        if (!validateConfig()) {
            return
        }
        setHasActiveSession(true)

        try {
            val token = FootprintQueries.createSDKArgs(
                SdkArgs(
                    // TODO add support for kind auth
                    kind = SdkArgs.Kind.verify_v1,
                    data = VerifyV1SdkArgs(
                        authToken = config.authToken,
                        documentFixtureResult = config.documentOutcome,
                        fixtureResult = config.overallOutcome,
                        isComponentsSdk = config.isComponentSdk,
                        l10n = L10nV1(
                            language = config.l10n?.language,
                            locale = config.l10n?.locale
                        ),
                        options = VerifyV1Options(
                            showLogo = config.options?.showLogo,
                            showCompletionPage = config.options?.showCompletionPage
                        ),
                        publicKey = config.publicKey,
                        sandboxId = config.sandboxId,
                        shouldRelayToComponents = config.shouldRelayToComponents,
                        userData = config.bootstrapData
                    )
                )
            )
            handleSdkArgsToken(
                config = config,
                context = context,
                token = token
            )
        } catch (e: Exception) {
            errorManager.log("Parsing SDK Args response failed. $e")
        }

    }
}