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

import org.openapitools.client.models.VerifyV1SdkArgs

import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*

/**
 * 
 *
 * @param `data` 
 * @param kind 
 */
@Serializable

data class SdkArgsVerifyV1 (

    @SerialName(value = "data") @Required val `data`: VerifyV1SdkArgs,

    @SerialName(value = "kind") @Required val kind: SdkArgsVerifyV1.Kind

) {

    /**
     * 
     *
     * Values: verify_v1
     */
    @Serializable
    enum class Kind(val value: kotlin.String) {
        @SerialName(value = "verify_v1") verify_v1("verify_v1");
    }

}

