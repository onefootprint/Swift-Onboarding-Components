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

import org.openapitools.client.models.VaultData

import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*

/**
 * 
 *
 * @param `data` 
 * @param op 
 * @param uuid 
 * @param ownershipStake 
 */
@Serializable

data class BatchHostedBusinessOwnerRequestCreate (

    @SerialName(value = "data") @Required val `data`: VaultData,

    @SerialName(value = "op") @Required val op: BatchHostedBusinessOwnerRequestCreate.Op,

    @SerialName(value = "uuid") @Required val uuid: kotlin.String,

    @SerialName(value = "ownership_stake") val ownershipStake: kotlin.Int? = null

) {

    /**
     * 
     *
     * Values: create
     */
    @Serializable
    enum class Op(val value: kotlin.String) {
        @SerialName(value = "create") create("create");
    }

}

