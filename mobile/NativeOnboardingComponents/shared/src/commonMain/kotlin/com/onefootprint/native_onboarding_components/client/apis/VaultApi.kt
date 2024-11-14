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

import org.openapitools.client.models.HostedUserDecryptRequest
import org.openapitools.client.models.ModernBusinessDecryptResponse
import org.openapitools.client.models.ModernRawBusinessDataRequest
import org.openapitools.client.models.ModernRawUserDataRequest
import org.openapitools.client.models.ModernUserDecryptResponse
import org.openapitools.client.models.UserDecryptRequest

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

open class VaultApi : ApiClient {

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
     * Decrypts the specified list of fields from the provided vault.
     * @param userDecryptRequest 
     * @param xFpAuthorization Short-lived auth token for a user during bifrost. Issued by identify and contains scopes to perform specific user actions. (optional)
     * @return ModernBusinessDecryptResponse
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun hostedBusinessVaultDecryptPost(userDecryptRequest: UserDecryptRequest, xFpAuthorization: kotlin.String? = null): HttpResponse<ModernBusinessDecryptResponse> {

        val localVariableAuthNames = listOf<String>("userOnboardingToken")

        val localVariableBody = userDecryptRequest

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xFpAuthorization?.apply { localVariableHeaders["X-Fp-Authorization"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.POST,
            "/hosted/business/vault/decrypt",
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
     * Updates data in a business vault. Can be used to update &#x60;business.&#x60; data
     * @param modernRawBusinessDataRequest Key-value map of data to add to the business&#39;s vault. For more documentation on available keys, see [here](https://docs.onefootprint.com/articles/vault/fields).
     * @param xFpAuthorization Short-lived auth token for a user during bifrost. Issued by identify and contains scopes to perform specific user actions. (optional)
     * @return kotlin.String
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun hostedBusinessVaultPatch_1(modernRawBusinessDataRequest: ModernRawBusinessDataRequest, xFpAuthorization: kotlin.String? = null): HttpResponse<kotlin.String> {

        val localVariableAuthNames = listOf<String>("userOnboardingToken")

        val localVariableBody = modernRawBusinessDataRequest

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xFpAuthorization?.apply { localVariableHeaders["X-Fp-Authorization"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.PATCH,
            "/hosted/business/vault",
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
     * Checks if provided vault data is valid before adding it to the business vault
     * @param modernRawBusinessDataRequest Key-value map of data to add to the business&#39;s vault. For more documentation on available keys, see [here](https://docs.onefootprint.com/articles/vault/fields).
     * @param xFpIsBootstrap Provide &#x60;true&#x60; if the data in the request is bootstrap data. (optional)
     * @param xFpAuthorization Short-lived auth token for a user during bifrost. Issued by identify and contains scopes to perform specific user actions. (optional)
     * @return kotlin.String
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun hostedBusinessVaultValidatePost_1(modernRawBusinessDataRequest: ModernRawBusinessDataRequest, xFpIsBootstrap: kotlin.Boolean? = null, xFpAuthorization: kotlin.String? = null): HttpResponse<kotlin.String> {

        val localVariableAuthNames = listOf<String>("userOnboardingToken")

        val localVariableBody = modernRawBusinessDataRequest

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xFpIsBootstrap?.apply { localVariableHeaders["X-Fp-Is-Bootstrap"] = this.toString() }
        xFpAuthorization?.apply { localVariableHeaders["X-Fp-Authorization"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.POST,
            "/hosted/business/vault/validate",
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
     * Decrypts the specified list of fields from the provided vault.
     * @param hostedUserDecryptRequest 
     * @param xFpAuthorization Short-lived auth token for a user. Issued by identify and contains scopes to perform specific user actions. (optional)
     * @return ModernUserDecryptResponse
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun hostedUserVaultDecryptPost(hostedUserDecryptRequest: HostedUserDecryptRequest, xFpAuthorization: kotlin.String? = null): HttpResponse<ModernUserDecryptResponse> {

        val localVariableAuthNames = listOf<String>("userToken")

        val localVariableBody = hostedUserDecryptRequest

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xFpAuthorization?.apply { localVariableHeaders["X-Fp-Authorization"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.POST,
            "/hosted/user/vault/decrypt",
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
     * Updates data in a user vault
     * @param modernRawUserDataRequest Key-value map of data to add to the user&#39;s vault. For more documentation on available keys, see [here](https://docs.onefootprint.com/articles/vault/fields).
     * @param xFpIsBootstrap Provide &#x60;true&#x60; if the data in the request is bootstrap data. (optional)
     * @param xFpAuthorization Short-lived auth token for a user during bifrost. Issued by identify and contains scopes to perform specific user actions. (optional)
     * @return kotlin.String
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun hostedUserVaultPatch(modernRawUserDataRequest: ModernRawUserDataRequest, xFpIsBootstrap: kotlin.Boolean? = null, xFpAuthorization: kotlin.String? = null): HttpResponse<kotlin.String> {

        val localVariableAuthNames = listOf<String>("userOnboardingToken")

        val localVariableBody = modernRawUserDataRequest

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xFpIsBootstrap?.apply { localVariableHeaders["X-Fp-Is-Bootstrap"] = this.toString() }
        xFpAuthorization?.apply { localVariableHeaders["X-Fp-Authorization"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.PATCH,
            "/hosted/user/vault",
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
     * Checks if provided vault data is valid before adding it to the vault
     * @param modernRawUserDataRequest Key-value map of data to add to the user&#39;s vault. For more documentation on available keys, see [here](https://docs.onefootprint.com/articles/vault/fields).
     * @param xFpAuthorization Short-lived auth token for a user during bifrost. Issued by identify and contains scopes to perform specific user actions. (optional)
     * @return kotlin.String
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun hostedUserVaultValidatePost(modernRawUserDataRequest: ModernRawUserDataRequest, xFpAuthorization: kotlin.String? = null): HttpResponse<kotlin.String> {

        val localVariableAuthNames = listOf<String>("userOnboardingToken")

        val localVariableBody = modernRawUserDataRequest

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xFpAuthorization?.apply { localVariableHeaders["X-Fp-Authorization"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.POST,
            "/hosted/user/vault/validate",
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
