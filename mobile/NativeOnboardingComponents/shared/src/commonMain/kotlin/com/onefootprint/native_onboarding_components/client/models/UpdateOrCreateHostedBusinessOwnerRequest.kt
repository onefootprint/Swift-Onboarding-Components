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

import org.openapitools.client.models.ModernRawUserDataRequest

import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*

/**
 * 
 *
 * @param `data` 
 * @param uuid 
 * @param ownershipStake 
 */
@Serializable

data class UpdateOrCreateHostedBusinessOwnerRequest (

    @SerialName(value = "data") @Required val `data`: ModernRawUserDataRequest,

    @SerialName(value = "uuid") @Required val uuid: kotlin.String,

    @SerialName(value = "ownership_stake") val ownershipStake: kotlin.Int? = null

) {


}

