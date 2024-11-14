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

import org.openapitools.client.models.IdentifyChallengeResponse
import org.openapitools.client.models.IdentifyRequest
import org.openapitools.client.models.IdentifyResponse
import org.openapitools.client.models.IdentifyVerifyRequest
import org.openapitools.client.models.IdentifyVerifyResponse
import org.openapitools.client.models.KbaResponse
import org.openapitools.client.models.LiteIdentifyRequest
import org.openapitools.client.models.LiteIdentifyResponse
import org.openapitools.client.models.LoginChallengeRequest
import org.openapitools.client.models.ModernRawUserDataRequest
import org.openapitools.client.models.SignupChallengeRequest

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

open class IdentifyApi : ApiClient {

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
     * Respond to a KBA challenge to prove knowledge of existing data in the vault.
     * @param modernRawUserDataRequest Key-value map of data to add to the user&#39;s vault. For more documentation on available keys, see [here](https://docs.onefootprint.com/articles/vault/fields).
     * @param xFpAuthorization Short-lived auth token for a user. Issued by identify and contains scopes to perform specific user actions. (optional)
     * @return KbaResponse
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun hostedIdentifyKbaPost(modernRawUserDataRequest: ModernRawUserDataRequest, xFpAuthorization: kotlin.String? = null): HttpResponse<KbaResponse> {

        val localVariableAuthNames = listOf<String>("userToken")

        val localVariableBody = modernRawUserDataRequest

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xFpAuthorization?.apply { localVariableHeaders["X-Fp-Authorization"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.POST,
            "/hosted/identify/kba",
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
     * Tries to identify an existing user by either phone number or email and returns whether a user exists. This is used exclusively in our SDK to check proactively if bootstrapped data identifies an existing user. This is very similar to the normal identify API, but it has a much simpler API will hopefully be more stable than the normal identify API since changes will break old SDK versions.
     * @param liteIdentifyRequest 
     * @param xKybBoToken Token to initialize KYC of a business owner. Uniquely identifies a business and beneficial owner. (optional)
     * @param xOnboardingConfigKey Long-lived, publishable key representing an onboarding configuration. You can create and view your credentials in the dashboard. (optional)
     * @return LiteIdentifyResponse
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun hostedIdentifyLitePost(liteIdentifyRequest: LiteIdentifyRequest, xKybBoToken: kotlin.String? = null, xOnboardingConfigKey: kotlin.String? = null): HttpResponse<LiteIdentifyResponse> {

        val localVariableAuthNames = listOf<String>("businessOwnerToken", "onboardingConfigToken", "onboardingConfigPublishableKey")

        val localVariableBody = liteIdentifyRequest

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xKybBoToken?.apply { localVariableHeaders["X-Kyb-Bo-Token"] = this.toString() }
        xOnboardingConfigKey?.apply { localVariableHeaders["X-Onboarding-Config-Key"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.POST,
            "/hosted/identify/lite",
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
     * Sends a challenge to the phone number and returns an HTTP 200. When the challenge is completed through the identify/verify endpoint, the client can get or create the user with this phone number.
     * @param loginChallengeRequest 
     * @param xFpAuthorization Short-lived auth token for a user. Issued by identify and contains scopes to perform specific user actions. (optional)
     * @return IdentifyChallengeResponse
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun hostedIdentifyLoginChallengePost(loginChallengeRequest: LoginChallengeRequest, xFpAuthorization: kotlin.String? = null): HttpResponse<IdentifyChallengeResponse> {

        val localVariableAuthNames = listOf<String>("userToken")

        val localVariableBody = loginChallengeRequest

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xFpAuthorization?.apply { localVariableHeaders["X-Fp-Authorization"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.POST,
            "/hosted/identify/login_challenge",
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
     * Tries to identify an existing user by either phone number or email. If the user is found, returns available challenge kinds.
     * @param identifyRequest 
     * @param xSandboxId When provided, creates a sandbox user with the provided sandbox ID. Sandbox IDs allow you to create multiple users with the same contact info. In order to log in using an existing sandbox user, you can provide its Sandbox ID in the Footprint flow.              (optional)
     * @param xKybBoToken Token to initialize KYC of a business owner. Uniquely identifies a business and beneficial owner. (optional)
     * @param xOnboardingConfigKey Long-lived, publishable key representing an onboarding configuration. You can create and view your credentials in the dashboard. (optional)
     * @param xFpAuthorization Short-lived auth token for a user. Issued by identify and contains scopes to perform specific user actions. (optional)
     * @return IdentifyResponse
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun hostedIdentifyPost(identifyRequest: IdentifyRequest, xSandboxId: kotlin.String? = null, xKybBoToken: kotlin.String? = null, xOnboardingConfigKey: kotlin.String? = null, xFpAuthorization: kotlin.String? = null): HttpResponse<IdentifyResponse> {

        val localVariableAuthNames = listOf<String>("userToken", "businessOwnerToken", "onboardingConfigToken", "onboardingConfigPublishableKey")

        val localVariableBody = identifyRequest

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xSandboxId?.apply { localVariableHeaders["X-Sandbox-Id"] = this.toString() }
        xKybBoToken?.apply { localVariableHeaders["X-Kyb-Bo-Token"] = this.toString() }
        xOnboardingConfigKey?.apply { localVariableHeaders["X-Onboarding-Config-Key"] = this.toString() }
        xFpAuthorization?.apply { localVariableHeaders["X-Fp-Authorization"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.POST,
            "/hosted/identify",
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
     * Sends a challenge to a phone number or email and returns an HTTP 200. When the challenge is completed through the identify/verify endpoint, the client can begin onboarding the user.
     * @param signupChallengeRequest 
     * @param xSandboxId When provided, creates a sandbox user with the provided sandbox ID. Sandbox IDs allow you to create multiple users with the same contact info. In order to log in using an existing sandbox user, you can provide its Sandbox ID in the Footprint flow.              (optional)
     * @param xFpIsComponentsSdk When a non-empty value is provided, indicates that the request is originating from the components SDK (optional)
     * @param xKybBoToken Token to initialize KYC of a business owner. Uniquely identifies a business and beneficial owner. (optional)
     * @param xOnboardingConfigKey Long-lived, publishable key representing an onboarding configuration. You can create and view your credentials in the dashboard. (optional)
     * @return IdentifyChallengeResponse
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun hostedIdentifySignupChallengePost(signupChallengeRequest: SignupChallengeRequest, xSandboxId: kotlin.String? = null, xFpIsComponentsSdk: kotlin.Boolean? = null, xKybBoToken: kotlin.String? = null, xOnboardingConfigKey: kotlin.String? = null): HttpResponse<IdentifyChallengeResponse> {

        val localVariableAuthNames = listOf<String>("businessOwnerToken", "onboardingConfigToken", "onboardingConfigPublishableKey")

        val localVariableBody = signupChallengeRequest

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xSandboxId?.apply { localVariableHeaders["X-Sandbox-Id"] = this.toString() }
        xFpIsComponentsSdk?.apply { localVariableHeaders["X-Fp-Is-Components-Sdk"] = this.toString() }
        xKybBoToken?.apply { localVariableHeaders["X-Kyb-Bo-Token"] = this.toString() }
        xOnboardingConfigKey?.apply { localVariableHeaders["X-Onboarding-Config-Key"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.POST,
            "/hosted/identify/signup_challenge",
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
     * Verifies the response to either an SMS or biometric challenge. When the challenge response is verified, we will return an auth token for the user. If no user exists (which may only happen after a phone challenge), we will create a new user with the provided phone number
     * @param identifyVerifyRequest 
     * @param xFpAuthorization Short-lived auth token for a user. Issued by identify and contains scopes to perform specific user actions. (optional)
     * @return IdentifyVerifyResponse
     */
    @Suppress("UNCHECKED_CAST")
    open suspend fun hostedIdentifyVerifyPost(identifyVerifyRequest: IdentifyVerifyRequest, xFpAuthorization: kotlin.String? = null): HttpResponse<IdentifyVerifyResponse> {

        val localVariableAuthNames = listOf<String>("userToken")

        val localVariableBody = identifyVerifyRequest

        val localVariableQuery = mutableMapOf<String, List<String>>()
        val localVariableHeaders = mutableMapOf<String, String>()
        xFpAuthorization?.apply { localVariableHeaders["X-Fp-Authorization"] = this.toString() }

        val localVariableConfig = RequestConfig<kotlin.Any?>(
            RequestMethod.POST,
            "/hosted/identify/verify",
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
