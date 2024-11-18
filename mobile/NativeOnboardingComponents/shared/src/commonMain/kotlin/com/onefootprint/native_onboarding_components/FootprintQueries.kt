package com.onefootprint.native_onboarding_components

import org.openapitools.client.apis.HostedApi
import org.openapitools.client.models.PublicOnboardingConfiguration

internal object FootprintQueries {
    suspend fun getOnboardingConfig(
        publicKey: String?,
        authToken: String?
    ): PublicOnboardingConfiguration {
        val api = HostedApi()
        val response =
            api.hostedOnboardingConfigGet_1(
                xOnboardingConfigKey = publicKey,
                xFpAuthorization = authToken
            )
        return response.body()
    }
}