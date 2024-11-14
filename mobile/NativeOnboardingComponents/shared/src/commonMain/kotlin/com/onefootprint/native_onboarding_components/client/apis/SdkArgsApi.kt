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

import org.openapitools.client.models.CreateSdkArgsTokenResponse
import org.openapitools.client.models.GetSdkArgsTokenResponse
import org.openapitools.client.models.LogBody
import org.openapitools.client.models.SdkArgs

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

open class SdkArgsApi : ApiClient {

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
     * Fetch information from an existing SDK args session.
     * @param xFpSdkArgsToken Short-lived token representing arguments for our SDK. (optional)
     * @return GetSdkArgsTokenResponse
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun orgSdkArgsGet(xFpSdkArgsToken: kotlin.String? = null): HttpResponse<GetSdkArgsTokenResponse> {

        val localVariableAuthNames = listOf<String>("sdkArgsToken")

        val localVariableBody = 
            io.ktor.client.utils.EmptyContent

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xFpSdkArgsToken?.apply { localVariableHeaders["X-Fp-Sdk-Args-Token"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.GET,
            "/org/sdk_args",
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


    /**
     * 
     * Create a new session containing args for the SDK.
     * @param sdkArgs 
     * @return CreateSdkArgsTokenResponse
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun orgSdkArgsPost(sdkArgs: SdkArgs): HttpResponse<CreateSdkArgsTokenResponse> {

        val localVariableAuthNames = listOf<String>()

        val localVariableBody = sdkArgs

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.POST,
            "/org/sdk_args",
            query = localVariableQuery,
            headers = localVariableHeaders,
            requiresAuthentication = false,
        )

        return jsonRequest(
            localVariableConfig,
            localVariableBody,
            localVariableAuthNames
        ).wrap()
    }



    /**
     * 
     * Log contents of the HTTP body. 
     * @param logBody 
     * @return kotlin.String
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun orgSdkTelemetryPost(logBody: LogBody): HttpResponse<kotlin.String> {

        val localVariableAuthNames = listOf<String>()

        val localVariableBody = logBody

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.POST,
            "/org/sdk_telemetry",
            query = localVariableQuery,
            headers = localVariableHeaders,
            requiresAuthentication = false,
        )

        return jsonRequest(
            localVariableConfig,
            localVariableBody,
            localVariableAuthNames
        ).wrap()
    }



}
