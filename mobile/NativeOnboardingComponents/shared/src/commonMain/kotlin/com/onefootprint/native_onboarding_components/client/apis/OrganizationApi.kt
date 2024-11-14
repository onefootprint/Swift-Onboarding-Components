/**
 *
 * Please note:
 * This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * Do not edit this file manually.
 *
 */

@file:Suppress(
    "ArrayInDataClass",
    "EnumEntryName",
    "RemoveRedundantQualifierName",
    "UnusedImport"
)

package org.openapitools.client.apis

import org.openapitools.client.models.PublicOnboardingConfiguration

import org.openapitools.client.infrastructure.*
import io.ktor.client.HttpClient
import io.ktor.client.HttpClientConfig
import io.ktor.client.request.forms.formData
import io.ktor.client.engine.HttpClientEngine
import kotlinx.serialization.json.Json
import io.ktor.http.ParametersBuilder
import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*

open class OrganizationApi : ApiClient {

    constructor(
        baseUrl: String = ApiClient.BASE_URL,
        httpClientEngine: HttpClientEngine? = null,
        httpClientConfig: ((HttpClientConfig<*>) -> Unit)? = null,
        jsonSerializer: Json = ApiClient.JSON_DEFAULT
    ) : super(baseUrl = baseUrl, httpClientEngine = httpClientEngine, httpClientConfig = httpClientConfig, jsonBlock = jsonSerializer)

    constructor(
        baseUrl: String,
        httpClient: HttpClient
    ): super(baseUrl = baseUrl, httpClient = httpClient)

    /**
     * 
     * Get the details of an onboarding configuration.
     * @param xKybBoToken Token to initialize KYC of a business owner. Uniquely identifies a business and beneficial owner. (optional)
     * @param xOnboardingConfigKey Long-lived, publishable key representing an onboarding configuration. You can create and view your credentials in the dashboard. (optional)
     * @param xFpAuthorization Short-lived auth token for a user. Issued by identify and contains scopes to perform specific user actions. (optional)
     * @return PublicOnboardingConfiguration
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun hostedOnboardingConfigGet_0(xKybBoToken: kotlin.String? = null, xOnboardingConfigKey: kotlin.String? = null, xFpAuthorization: kotlin.String? = null): HttpResponse<PublicOnboardingConfiguration> {

        val localVariableAuthNames = listOf<String>("userToken", "businessOwnerToken", "onboardingConfigToken", "onboardingConfigPublishableKey")

        val localVariableBody = 
            io.ktor.client.utils.EmptyContent

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xKybBoToken?.apply { localVariableHeaders["X-Kyb-Bo-Token"] = this.toString() }
        xOnboardingConfigKey?.apply { localVariableHeaders["X-Onboarding-Config-Key"] = this.toString() }
        xFpAuthorization?.apply { localVariableHeaders["X-Fp-Authorization"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.GET,
            "/hosted/onboarding/config",
            query = localVariableQuery,
            headers = localVariableHeaders,
            requiresAuthentication = true,
        )

        return request(
            localVariableConfig,
            localVariableBody,
            localVariableAuthNames
        ).wrap()
    }


}
