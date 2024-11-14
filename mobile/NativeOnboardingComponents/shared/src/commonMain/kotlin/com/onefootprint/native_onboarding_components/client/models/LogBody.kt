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


import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*

/**
 * 
 *
 * @param logLevel 
 * @param logMessage 
 * @param sdkKind Really SdkArgsKind, but prefer for this telemetry API to be unopinionated on validation
 * @param sdkName 
 * @param sdkVersion 
 * @param sessionId 
 * @param tenantDomain 
 */
@Serializable

data class LogBody (

    @SerialName(value = "log_level") val logLevel: kotlin.String? = null,

    @SerialName(value = "log_message") val logMessage: kotlin.String? = null,

    /* Really SdkArgsKind, but prefer for this telemetry API to be unopinionated on validation */
    @SerialName(value = "sdk_kind") val sdkKind: kotlin.String? = null,

    @SerialName(value = "sdk_name") val sdkName: kotlin.String? = null,

    @SerialName(value = "sdk_version") val sdkVersion: kotlin.String? = null,

    @SerialName(value = "session_id") val sessionId: kotlin.String? = null,

    @SerialName(value = "tenant_domain") val tenantDomain: kotlin.String? = null

) {


}

