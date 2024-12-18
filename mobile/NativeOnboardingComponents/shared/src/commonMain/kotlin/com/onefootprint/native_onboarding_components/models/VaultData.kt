package com.onefootprint.native_onboarding_components.models

import org.openapitools.client.models.DataIdentifier
import org.openapitools.client.models.Iso3166TwoDigitCountryCode
import org.openapitools.client.models.ModernRawUserDataRequest
import org.openapitools.client.models.ModernUserDecryptResponse

class VaultData(private val data: Map<DataIdentifier, Any?>) {
    companion object {
        private val allowedIdentifiers = setOf(
            DataIdentifier.idFirstName,
            DataIdentifier.idMiddleName,
            DataIdentifier.idLastName,
            DataIdentifier.idDob,
            DataIdentifier.idSsn4,
            DataIdentifier.idSsn9,
            DataIdentifier.idUsTaxId,
            DataIdentifier.idAddressLine1,
            DataIdentifier.idAddressLine2,
            DataIdentifier.idCity,
            DataIdentifier.idState,
            DataIdentifier.idZip,
            DataIdentifier.idCountry,
            DataIdentifier.idEmail,
            DataIdentifier.idPhoneNumber,
            DataIdentifier.idNationality,
            DataIdentifier.idUsLegalStatus,
            DataIdentifier.idVisaKind,
            DataIdentifier.idVisaExpirationDate,
            DataIdentifier.idCitizenships,
            DataIdentifier.idDriversLicenseNumber,
            DataIdentifier.idDriversLicenseState,
            DataIdentifier.idItin
        )

        internal fun fromModernUserDecryptResponse(from: ModernUserDecryptResponse): VaultData {
            val data = mutableMapOf<DataIdentifier, Any>()
            val idFirstName = from.idFirstName
            val idMiddleName = from.idMiddleName
            val idLastName = from.idLastName
            val idDob = from.idDob
            val idSsn4 = from.idSsn4
            val idSsn9 = from.idSsn9
            val idUsTaxId = from.idUsTaxId
            val idAddressLine1 = from.idAddressLine1
            val idAddressLine2 = from.idAddressLine2
            val idCity = from.idCity
            val idState = from.idState
            val idZip = from.idZip
            val idCountry = from.idCountry
            val idEmail = from.idEmail
            val idPhoneNumber = from.idPhoneNumber
            val idUsLegalStatus = from.idUsLegalStatus
            val idVisaKind = from.idVisaKind
            val idVisaExpirationDate = from.idVisaExpirationDate
            val idCitizenships = from.idCitizenships
            val idNationality = from.idNationality
            val idDriversLicenseNumber = from.idDriversLicenseNumber
            val idDriversLicenseState = from.idDriversLicenseState
            val idItin = from.idItin
            return VaultData(
                mapOf(
                    DataIdentifier.idFirstName to idFirstName,
                    DataIdentifier.idMiddleName to idMiddleName,
                    DataIdentifier.idLastName to idLastName,
                    DataIdentifier.idDob to idDob,
                    DataIdentifier.idSsn4 to idSsn4,
                    DataIdentifier.idSsn9 to idSsn9,
                    DataIdentifier.idUsTaxId to idUsTaxId,
                    DataIdentifier.idAddressLine1 to idAddressLine1,
                    DataIdentifier.idAddressLine2 to idAddressLine2,
                    DataIdentifier.idCity to idCity,
                    DataIdentifier.idState to idState,
                    DataIdentifier.idZip to idZip,
                    DataIdentifier.idCountry to idCountry,
                    DataIdentifier.idEmail to idEmail,
                    DataIdentifier.idPhoneNumber to idPhoneNumber,
                    DataIdentifier.idUsLegalStatus to idUsLegalStatus,
                    DataIdentifier.idVisaKind to idVisaKind,
                    DataIdentifier.idVisaExpirationDate to idVisaExpirationDate,
                    DataIdentifier.idCitizenships to idCitizenships,
                    DataIdentifier.idNationality to idNationality,
                    DataIdentifier.idDriversLicenseNumber to idDriversLicenseNumber,
                    DataIdentifier.idDriversLicenseState to idDriversLicenseState,
                    DataIdentifier.idItin to idItin
                )
            )
        }
    }

    init {
        val invalidKeys = data.keys.filter { it !in allowedIdentifiers }
        require(invalidKeys.isEmpty()) {
            "VaultData contains invalid/unsupported keys: $invalidKeys"
        }
    }

    // Expose the validated map
    fun asMap(): Map<DataIdentifier, Any?> = data

    internal fun toModernRawUserDataRequest(): ModernRawUserDataRequest{
        val idFirstName = data[DataIdentifier.idFirstName]
        val idMiddleName = data[DataIdentifier.idMiddleName]
        val idLastName = data[DataIdentifier.idLastName]
        val idDob = data[DataIdentifier.idDob]
        val idSsn4 = data[DataIdentifier.idSsn4]
        val idSsn9 = data[DataIdentifier.idSsn9]
        val idUsTaxId = data[DataIdentifier.idUsTaxId]
        val idAddressLine1 = data[DataIdentifier.idAddressLine1]
        val idAddressLine2 = data[DataIdentifier.idAddressLine2]
        val idCity = data[DataIdentifier.idCity]
        val idState = data[DataIdentifier.idState]
        val idZip = data[DataIdentifier.idZip]
        val idCountry = data[DataIdentifier.idCountry]
        val idEmail = data[DataIdentifier.idEmail]
        val idPhoneNumber = data[DataIdentifier.idPhoneNumber]
        val idUsLegalStatus = data[DataIdentifier.idUsLegalStatus]
        val idVisaKind = data[DataIdentifier.idVisaKind]
        val idVisaExpirationDate = data[DataIdentifier.idVisaExpirationDate]
        val idCitizenships = data[DataIdentifier.idCitizenships]
        val idNationality = data[DataIdentifier.idNationality]
        val idDriversLicenseNumber = data[DataIdentifier.idDriversLicenseNumber]
        val idDriversLicenseState = data[DataIdentifier.idDriversLicenseState]
        val idItin = data[DataIdentifier.idItin]
        val modernRawUserDataRequest = ModernRawUserDataRequest(
            idFirstName = when (idFirstName) {
                is String -> idFirstName.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idFirstName to be a String")
            },
            idLastName = when (idLastName) {
                is String -> idLastName.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idLastName to be a String")
            },
            idMiddleName = when (idMiddleName) {
                is String -> idMiddleName.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idMiddleName to be a String")
            },
            idDob = when (idDob) {
                is String -> idDob.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idDob to be a String")
            },
            idSsn4 = when (idSsn4) {
                is String -> idSsn4.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idSsn4 to be a String")
            },
            idSsn9 = when (idSsn9) {
                is String -> idSsn9.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idSsn9 to be a String")
            },
            idUsTaxId = when (idUsTaxId) {
                is String -> idUsTaxId.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idUsTaxId to be a String")
            },
            idAddressLine1 = when (idAddressLine1) {
                is String -> idAddressLine1.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idAddressLine1 to be a String")
            },
            idAddressLine2 = when (idAddressLine2) {
                is String -> idAddressLine2.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idAddressLine2 to be a String")
            },
            idCity = when (idCity) {
                is String -> idCity.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idCity to be a String")
            },
            idState = when (idState) {
                is String -> idState.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idState to be a String")
            },
            idZip = when (idZip) {
                is String -> idZip.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idZip to be a String")
            },
            idCountry = when (idCountry) {
                is String -> idCountry.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idCountry to be a String")
            },
            idEmail = when (idEmail) {
                is String -> idEmail.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idEmail to be a String")
            },
            idPhoneNumber = when (idPhoneNumber) {
                is String -> idPhoneNumber.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idPhoneNumber to be a String")
            },
            idUsLegalStatus = when (idUsLegalStatus) {
                is String -> idUsLegalStatus.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idUsLegalStatus to be a String")
            },
            idVisaKind = when (idVisaKind) {
                is String -> idVisaKind.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idVisaKind to be a String")
            },
            idVisaExpirationDate = when (idVisaExpirationDate) {
                is String -> idVisaExpirationDate.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idVisaExpirationDate to be a String")
            },
            idCitizenships = when {
                idCitizenships is List<*> && idCitizenships.all { it is Iso3166TwoDigitCountryCode } -> {
                    @Suppress("UNCHECKED_CAST") // We've just checked that all elements are of the correct type
                    idCitizenships as List<Iso3166TwoDigitCountryCode>
                }
                idCitizenships == null -> null
                else -> throw IllegalArgumentException("Expected idCitizenships to be a List<Iso3166TwoDigitCountryCode>")
            },
            idNationality = when (idNationality) {
                is String -> idNationality.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idNationality to be a Iso3166TwoDigitCountryCode")
            },
            idDriversLicenseNumber = when (idDriversLicenseNumber) {
                is String -> idDriversLicenseNumber.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idDriversLicenseNumber to be a String")
            },
            idDriversLicenseState = when (idDriversLicenseState) {
                is String -> idDriversLicenseState.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idDriversLicenseState to be a String")
            },
            idItin = when (idItin) {
                is String -> idItin.ifEmpty { null }
                null -> null
                else -> throw IllegalArgumentException("Expected idItin to be a String")
            }
        )
        return modernRawUserDataRequest
    }

    // getters for all the fields
    val idFirstName: String? get() = data[DataIdentifier.idFirstName] as? String
    val idMiddleName: String? get() = data[DataIdentifier.idMiddleName] as? String
    val idLastName: String? get() = data[DataIdentifier.idLastName] as? String
    val idDob: String? get() = data[DataIdentifier.idDob] as? String
    val idSsn4: String? get() = data[DataIdentifier.idSsn4] as? String
    val idSsn9: String? get() = data[DataIdentifier.idSsn9] as? String
    val idUsTaxId: String? get() = data[DataIdentifier.idUsTaxId] as? String
    val idAddressLine1: String? get() = data[DataIdentifier.idAddressLine1] as? String
    val idAddressLine2: String? get() = data[DataIdentifier.idAddressLine2] as? String
    val idCity: String? get() = data[DataIdentifier.idCity] as? String
    val idState: String? get() = data[DataIdentifier.idState] as? String
    val idZip: String? get() = data[DataIdentifier.idZip] as? String
    val idCountry: String? get() = data[DataIdentifier.idCountry] as? String
    val idEmail: String? get() = data[DataIdentifier.idEmail] as? String
    val idPhoneNumber: String? get() = data[DataIdentifier.idPhoneNumber] as? String
    val idUsLegalStatus: String? get() = data[DataIdentifier.idUsLegalStatus] as? String
    val idVisaKind: String? get() = data[DataIdentifier.idVisaKind] as? String
    val idVisaExpirationDate: String? get() = data[DataIdentifier.idVisaExpirationDate] as? String
    val idCitizenships: List<Iso3166TwoDigitCountryCode>? get() = data[DataIdentifier.idCitizenships] as? List<Iso3166TwoDigitCountryCode>
    val idNationality: String? get() = data[DataIdentifier.idNationality] as? String
    val idDriversLicenseNumber: String? get() = data[DataIdentifier.idDriversLicenseNumber] as? String
    val idDriversLicenseState: String? get() = data[DataIdentifier.idDriversLicenseState] as? String
    val idItin: String? get() = data[DataIdentifier.idItin] as? String


    override fun toString(): String {
        return "VaultData(data=$data)"
    }
}
