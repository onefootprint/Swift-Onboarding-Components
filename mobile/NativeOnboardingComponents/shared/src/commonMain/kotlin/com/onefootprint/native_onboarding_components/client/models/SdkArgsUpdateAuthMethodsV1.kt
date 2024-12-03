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

import org.openapitools.client.models.UpdateAuthMethodsV1SdkArgs

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

data class SdkArgsUpdateAuthMethodsV1 (

    @SerialName(value = "data") @Required val `data`: UpdateAuthMethodsV1SdkArgs,

    @SerialName(value = "kind") @Required val kind: SdkArgsUpdateAuthMethodsV1.Kind

) {

    /**
     * 
     *
     * Values: update_auth_methods_v1
     */
    @Serializable
    enum class Kind(val value: kotlin.String) {
        @SerialName(value = "update_auth_methods_v1") update_auth_methods_v1("update_auth_methods_v1");
    }

}

