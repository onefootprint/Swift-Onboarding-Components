package com.onefootprint.native_onboarding_components.models
import kotlinx.serialization.*

/**
 * @param code
 * @param message
 * @param supportId
 * @param debug
 * @param location
 * @param context
 */
@Serializable
internal data class HttpError (
    @SerialName(value = "code") @Required val code: kotlin.String? = null,

    @SerialName(value = "message") @Required val message: kotlin.String,

    @SerialName(value = "support_id") @Required val supportId: kotlin.String,

    @SerialName(value = "debug") val debug: kotlin.String? = null,

    @SerialName(value = "location") val location: kotlin.String? = null,

    @SerialName(value = "context") val context: Map<String, String>? = null
) {}

