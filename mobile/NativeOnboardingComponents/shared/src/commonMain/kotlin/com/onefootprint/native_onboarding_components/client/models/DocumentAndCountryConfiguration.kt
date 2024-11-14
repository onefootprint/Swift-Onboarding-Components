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

import org.openapitools.client.models.IdDocKind

import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*

/**
 * 
 *
 * @param countrySpecific 
 * @param global 
 */
@Serializable

data class DocumentAndCountryConfiguration (

    @SerialName(value = "country_specific") @Required val countrySpecific: kotlin.String,

    @SerialName(value = "global") @Required val global: kotlin.collections.List<IdDocKind>

) {


}

