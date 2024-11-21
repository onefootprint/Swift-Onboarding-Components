package com.onefootprint.native_onboarding_components

import com.onefootprint.native_onboarding_components.models.FootprintException
import com.onefootprint.native_onboarding_components.models.HttpError
import io.ktor.client.call.body
import org.openapitools.client.apis.HostedApi
import org.openapitools.client.models.PublicOnboardingConfiguration

class Greeting {
    private val platform = getPlatform()

    suspend fun getOnboardingConfig(): PublicOnboardingConfiguration? {
        val api = HostedApi()

            // pb_test_qGrzwX22Vu5IGRsjbBFS4s
            val response = api.hostedOnboardingConfigGet_1(xOnboardingConfigKey = "12312321")

            println("Hosted onboarding config isSuccess: ${response.success}")

            if (!response.success) {
                val error = response.response.body<HttpError>()
                println("Hosted onboarding error: $error")

                throw FootprintException(FootprintException.ErrorKind.ONBOARDING_ERROR, error.message, supportId = error.supportId)
            }
            return response.body()
    }
}