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

import org.openapitools.client.models.DataIdentifier
import org.openapitools.client.models.DocumentUploadSettings

import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*

/**
 * 
 *
 * @param identifier 
 * @param name The human-readable name of the document to display to the user
 * @param requiresHumanReview 
 * @param uploadSettings 
 * @param description Optional human-readable description of the document that will be displayed to the user
 */
@Serializable

data class CustomDocumentConfig (

    @SerialName(value = "identifier") @Required val identifier: DataIdentifier,

    /* The human-readable name of the document to display to the user */
    @SerialName(value = "name") @Required val name: kotlin.String,

    @SerialName(value = "requires_human_review") @Required val requiresHumanReview: kotlin.Boolean,

    @SerialName(value = "upload_settings") @Required val uploadSettings: DocumentUploadSettings,

    /* Optional human-readable description of the document that will be displayed to the user */
    @SerialName(value = "description") val description: kotlin.String? = null

) {


}

