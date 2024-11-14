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

package org.openapitools.client.models

import org.openapitools.client.models.DocumentFixtureResult
import org.openapitools.client.models.L10nV1
import org.openapitools.client.models.VerifyV1Options
import org.openapitools.client.models.WorkflowFixtureResult

import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*

/**
 * 
 *
 * @param authToken 
 * @param documentFixtureResult 
 * @param fixtureResult 
 * @param isComponentsSdk The components SDK wraps the verify SDK with the same args
 * @param l10n 
 * @param options 
 * @param publicKey 
 * @param sandboxId 
 * @param shouldRelayToComponents 
 * @param userData 
 */
@Serializable

data class VerifyV1SdkArgs (

    @SerialName(value = "auth_token") val authToken: kotlin.String? = null,

    @SerialName(value = "document_fixture_result") val documentFixtureResult: DocumentFixtureResult? = null,

    @SerialName(value = "fixture_result") val fixtureResult: WorkflowFixtureResult? = null,

    /* The components SDK wraps the verify SDK with the same args */
    @SerialName(value = "is_components_sdk") val isComponentsSdk: kotlin.Boolean? = null,

    @SerialName(value = "l10n") val l10n: L10nV1? = null,

    @SerialName(value = "options") val options: VerifyV1Options? = null,

    @SerialName(value = "public_key") val publicKey: kotlin.String? = null,

    @SerialName(value = "sandbox_id") val sandboxId: kotlin.String? = null,

    @SerialName(value = "should_relay_to_components") val shouldRelayToComponents: kotlin.Boolean? = null,

    @SerialName(value = "user_data") val userData: kotlin.String? = null

) {


}

