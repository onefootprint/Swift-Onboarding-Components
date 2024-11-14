package com.onefootprint.native_onboarding_components

import org.openapitools.client.apis.HostedApi
import org.openapitools.client.infrastructure.HttpResponse
import org.openapitools.client.models.PublicOnboardingConfiguration

class Greeting {
    private val platform = getPlatform()

    suspend fun getOnboardingConfig(): PublicOnboardingConfiguration? {
        val api = HostedApi()
        try {
            val response =
                api.hostedOnboardingConfigGet_1(xOnboardingConfigKey = "pb_test_qGrzwX22Vu5IGRsjbBFS4s")

            println("Hosted onboarding config response: ${response.body()}")

            return response.body()
        } catch (e: Exception) {
            println("Error getting hosted onboarding config: ${e.message}")
        }

        return null
    }
}