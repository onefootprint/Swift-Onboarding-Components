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

import org.openapitools.client.models.UserChallengeRequest
import org.openapitools.client.models.UserChallengeResponse
import org.openapitools.client.models.UserChallengeVerifyRequest
import org.openapitools.client.models.UserChallengeVerifyResponse

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

open class ChallengeApi : ApiClient {

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
     * Sends a challenge of the requested kind
     * @param userChallengeRequest 
     * @param xFpAuthorization Short-lived auth token for a user. Issued by identify and contains scopes to perform specific user actions. (optional)
     * @return UserChallengeResponse
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun hostedUserChallengePost(userChallengeRequest: UserChallengeRequest, xFpAuthorization: kotlin.String? = null): HttpResponse<UserChallengeResponse> {

        val localVariableAuthNames = listOf<String>("userToken")

        val localVariableBody = userChallengeRequest

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xFpAuthorization?.apply { localVariableHeaders["X-Fp-Authorization"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.POST,
            "/hosted/user/challenge",
            query = localVariableQuery,
            headers = localVariableHeaders,
            requiresAuthentication = true,
        )

        return jsonRequest(
            localVariableConfig,
            localVariableBody,
            localVariableAuthNames
        ).wrap()
    }



    /**
     * 
     * Verify the previously sent challenge and attach the new form of contact info to the vault
     * @param userChallengeVerifyRequest 
     * @param xFpAuthorization Short-lived auth token for a user. Issued by identify and contains scopes to perform specific user actions. (optional)
     * @return UserChallengeVerifyResponse
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun hostedUserChallengeVerifyPost(userChallengeVerifyRequest: UserChallengeVerifyRequest, xFpAuthorization: kotlin.String? = null): HttpResponse<UserChallengeVerifyResponse> {

        val localVariableAuthNames = listOf<String>("userToken")

        val localVariableBody = userChallengeVerifyRequest

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xFpAuthorization?.apply { localVariableHeaders["X-Fp-Authorization"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.POST,
            "/hosted/user/challenge/verify",
            query = localVariableQuery,
            headers = localVariableHeaders,
            requiresAuthentication = true,
        )

        return jsonRequest(
            localVariableConfig,
            localVariableBody,
            localVariableAuthNames
        ).wrap()
    }



}
