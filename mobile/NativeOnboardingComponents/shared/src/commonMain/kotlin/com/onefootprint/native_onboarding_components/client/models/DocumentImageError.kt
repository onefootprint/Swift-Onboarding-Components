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

/**
 * 
 *
 * Values: image_too_small,document_missing_four_corners,document_too_small,document_border_too_small,face_image_not_detected,barcode_not_detected,invalid_jpeg,document_is_skewed,internal_error,image_error,doc_type_mismatch,unknown_document_type,unsupported_document_type,wrong_document_side,wrong_one_sided_document,document_not_readable,unable_to_align_document,id_type_not_acceptable,selfie_face_not_found,face_not_found,selfie_low_confidence,selfie_too_dark,selfie_glare,selfie_has_lenses,selfie_has_face_mask,selfie_blurry,selfie_image_size_unsupported,selfie_image_orientation_incorrect,selfie_bad_image_compression,drivers_license_permit_not_allowed,unknown_country_code,country_code_mismatch,unknown_error,document_glare,document_sharpness,military_id_not_allowed
 */
@Serializable
enum class DocumentImageError(val value: kotlin.String) {

    @SerialName(value = "image_too_small")
    image_too_small("image_too_small"),

    @SerialName(value = "document_missing_four_corners")
    document_missing_four_corners("document_missing_four_corners"),

    @SerialName(value = "document_too_small")
    document_too_small("document_too_small"),

    @SerialName(value = "document_border_too_small")
    document_border_too_small("document_border_too_small"),

    @SerialName(value = "face_image_not_detected")
    face_image_not_detected("face_image_not_detected"),

    @SerialName(value = "barcode_not_detected")
    barcode_not_detected("barcode_not_detected"),

    @SerialName(value = "invalid_jpeg")
    invalid_jpeg("invalid_jpeg"),

    @SerialName(value = "document_is_skewed")
    document_is_skewed("document_is_skewed"),

    @SerialName(value = "internal_error")
    internal_error("internal_error"),

    @SerialName(value = "image_error")
    image_error("image_error"),

    @SerialName(value = "doc_type_mismatch")
    doc_type_mismatch("doc_type_mismatch"),

    @SerialName(value = "unknown_document_type")
    unknown_document_type("unknown_document_type"),

    @SerialName(value = "unsupported_document_type")
    unsupported_document_type("unsupported_document_type"),

    @SerialName(value = "wrong_document_side")
    wrong_document_side("wrong_document_side"),

    @SerialName(value = "wrong_one_sided_document")
    wrong_one_sided_document("wrong_one_sided_document"),

    @SerialName(value = "document_not_readable")
    document_not_readable("document_not_readable"),

    @SerialName(value = "unable_to_align_document")
    unable_to_align_document("unable_to_align_document"),

    @SerialName(value = "id_type_not_acceptable")
    id_type_not_acceptable("id_type_not_acceptable"),

    @SerialName(value = "selfie_face_not_found")
    selfie_face_not_found("selfie_face_not_found"),

    @SerialName(value = "face_not_found")
    face_not_found("face_not_found"),

    @SerialName(value = "selfie_low_confidence")
    selfie_low_confidence("selfie_low_confidence"),

    @SerialName(value = "selfie_too_dark")
    selfie_too_dark("selfie_too_dark"),

    @SerialName(value = "selfie_glare")
    selfie_glare("selfie_glare"),

    @SerialName(value = "selfie_has_lenses")
    selfie_has_lenses("selfie_has_lenses"),

    @SerialName(value = "selfie_has_face_mask")
    selfie_has_face_mask("selfie_has_face_mask"),

    @SerialName(value = "selfie_blurry")
    selfie_blurry("selfie_blurry"),

    @SerialName(value = "selfie_image_size_unsupported")
    selfie_image_size_unsupported("selfie_image_size_unsupported"),

    @SerialName(value = "selfie_image_orientation_incorrect")
    selfie_image_orientation_incorrect("selfie_image_orientation_incorrect"),

    @SerialName(value = "selfie_bad_image_compression")
    selfie_bad_image_compression("selfie_bad_image_compression"),

    @SerialName(value = "drivers_license_permit_not_allowed")
    drivers_license_permit_not_allowed("drivers_license_permit_not_allowed"),

    @SerialName(value = "unknown_country_code")
    unknown_country_code("unknown_country_code"),

    @SerialName(value = "country_code_mismatch")
    country_code_mismatch("country_code_mismatch"),

    @SerialName(value = "unknown_error")
    unknown_error("unknown_error"),

    @SerialName(value = "document_glare")
    document_glare("document_glare"),

    @SerialName(value = "document_sharpness")
    document_sharpness("document_sharpness"),

    @SerialName(value = "military_id_not_allowed")
    military_id_not_allowed("military_id_not_allowed");

    /**
     * Override [toString()] to avoid using the enum variable name as the value, and instead use
     * the actual value defined in the API spec file.
     *
     * This solves a problem when the variable name and its value are different, and ensures that
     * the client sends the correct enum values to the server always.
     */
    override fun toString(): kotlin.String = value

    companion object {
        /**
         * Converts the provided [data] to a [String] on success, null otherwise.
         */
        fun encode(data: kotlin.Any?): kotlin.String? = if (data is DocumentImageError) "$data" else null

        /**
         * Returns a valid [DocumentImageError] for [data], null otherwise.
         */
        fun decode(data: kotlin.Any?): DocumentImageError? = data?.let {
          val normalizedData = "$it".lowercase()
          values().firstOrNull { value ->
            it == value || normalizedData == "$value".lowercase()
          }
        }
    }
}

