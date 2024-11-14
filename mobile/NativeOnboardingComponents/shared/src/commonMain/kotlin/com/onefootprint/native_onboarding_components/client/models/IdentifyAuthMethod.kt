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

import org.openapitools.client.models.AuthMethodKind

import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*

/**
 * 
 *
 * @param isVerified 
 * @param kind 
 */
@Serializable

data class IdentifyAuthMethod (

    @SerialName(value = "is_verified") @Required val isVerified: kotlin.Boolean,

    @SerialName(value = "kind") @Required val kind: AuthMethodKind

) {


}

