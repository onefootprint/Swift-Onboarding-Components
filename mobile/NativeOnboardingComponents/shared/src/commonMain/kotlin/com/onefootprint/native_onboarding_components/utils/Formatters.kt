package com.onefootprint.native_onboarding_components.utils

import com.onefootprint.native_onboarding_components.models.FootprintException
import com.onefootprint.native_onboarding_components.models.FootprintSupportedLocale
import com.onefootprint.native_onboarding_components.models.VaultData
import kotlinx.datetime.LocalDate
import org.openapitools.client.models.DataIdentifier

internal object Formatters {
    /// Converts a date string to US date format (MM/DD/YYYY or DD/MM/YYYY) based on the locale.
    ///
    /// - Parameters:
    ///   - locale: Locale specifying the date format, either `enUS` or `esMX`.
    ///   - str: A date string in the format 'DD/MM/YYYY' or 'MM/DD/YYYY'.
    /// - Returns: The date string in the format 'MM/DD/YYYY'.
    fun strInputToUSDate(locale: FootprintSupportedLocale, str: String): String {
        val dateParts = str.split("/")
        val expectedFormat = if (locale == FootprintSupportedLocale.EN_US) "MM/DD/YYYY" else "DD/MM/YYYY"

        if (dateParts.size != 3) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.FORMAT_ERROR,
                message = "Invalid date format. Expected 'DD/MM/YYYY' or 'MM/DD/YYYY'."
            )
        }

        val day = if (locale == FootprintSupportedLocale.EN_US) dateParts[1] else dateParts[0]
        val month = if (locale == FootprintSupportedLocale.EN_US) dateParts[0] else dateParts[1]
        val year = dateParts[2]

        // Ensure the date is valid
        if (!isValidDate(day, month, year)) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.FORMAT_ERROR,
                message = "Invalid date format. Expected $expectedFormat."
            )
        }

        return "$month/$day/$year"
    }

    /// Converts a US date string to a date string based on the locale format.
    ///
    /// - Parameters:
    ///   - locale: Locale specifying the output format, either `enUS` or `esMX`.
    ///   - str: A date string in the format 'MM/DD/YYYY' or 'DD/MM/YYYY'.
    /// - Returns: The date string formatted as 'MM/DD/YYYY' or 'DD/MM/YYYY' based on the locale.
    fun fromUsDateToStringInput(locale: FootprintSupportedLocale, str: String): String {
        val dateParts = str.split("/")
        val expectedFormat = if (locale == FootprintSupportedLocale.EN_US) "MM/DD/YYYY" else "DD/MM/YYYY"

        if (dateParts.size != 3) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.FORMAT_ERROR,
                message = "Invalid date format. Expected 'DD/MM/YYYY' or 'MM/DD/YYYY'."
            )
        }

        val day = dateParts[1]
        val month = dateParts[0]
        val year = dateParts[2]

        // Ensure the date is valid
        if (!isValidDate(day, month, year)) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.FORMAT_ERROR,
                message = "Invalid date format. Expected $expectedFormat."
            )
        }

        return if (locale == FootprintSupportedLocale.EN_US) {
            "$month/$day/$year"
        } else {
            "$day/$month/$year"
        }
    }

    /// Converts a US date string (MM/DD/YYYY or DD/MM/YYYY) to ISO 8601 format (YYYY-MM-DD).
    ///
    /// - Parameter date: A date string in the format 'MM/DD/YYYY' or 'DD/MM/YYYY'.
    /// - Returns: A date string in ISO 8601 format 'YYYY-MM-DD' or nil if the input is invalid.
    fun fromUsDateToISO8601(date: String): String {
        val dateParts = date.split("/")

        if (dateParts.size != 3) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.FORMAT_ERROR,
                message = "Invalid date format. Expected 'DD/MM/YYYY' or 'MM/DD/YYYY'."
            )
        }

        val day = dateParts[1]
        val month = dateParts[0]
        val year = dateParts[2]

        // Ensure the date is valid
        if (!isValidDate(day, month, year)) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.FORMAT_ERROR,
                message = "Invalid date format. Expected 'MM/DD/YYYY'."
            )
        }

        return "$year-$month-$day"
    }

    /// Converts an ISO 8601 date string (YYYY-MM-DD) to US date format (MM/DD/YYYY).
    ///
    /// - Parameter date: A date string in the format 'YYYY-MM-DD'.
    /// - Returns: A date string in US format 'MM/DD/YYYY' or nil if the input is invalid.
    fun fromISO8601ToUsDate(date: String): String {
        val dateParts = date.split("-")

        if (dateParts.size != 3) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.FORMAT_ERROR,
                message = "Invalid date format. Expected 'YYYY-MM-DD'."
            )
        }

        val year = dateParts[0]
        val month = dateParts[1]
        val day = dateParts[2]

        // Ensure the date is valid
        if (!isValidDate(day, month, year)) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.FORMAT_ERROR,
                message = "Invalid date format. Expected 'YYYY-MM-DD'."
            )
        }

        return "$month/$day/$year"
    }

    private fun isValidDate(day: String, month: String, year: String): Boolean {
        if (day.toIntOrNull() == null || month.toIntOrNull() == null || year.toIntOrNull() == null) {
            return false
        }else if (day.toInt() < 1 || day.toInt() > 31 || month.toInt() < 1 || month.toInt() > 12) {
            return false
        }

        // try converting to a real date
        try {
            val date = LocalDate.parse("$year-$month-$day")
            return true
        } catch (e: Exception) {
            return false
        }
    }

    fun formatBeforeSave(data: VaultData, locale: FootprintSupportedLocale): VaultData {
        val dataMap = data.asMap().toMutableMap()
        var dob = dataMap[DataIdentifier.idDob]
        var visaExpiration = dataMap[DataIdentifier.idVisaExpirationDate]

        if (dob != null && dob is String) {
            dob = strInputToUSDate(locale, dob)
            dob = fromUsDateToISO8601(dob)
            dataMap[DataIdentifier.idDob] = dob
        }

        if (visaExpiration != null && visaExpiration is String) {
            visaExpiration = strInputToUSDate(locale, visaExpiration)
            visaExpiration = fromUsDateToISO8601(visaExpiration)
            dataMap[DataIdentifier.idVisaExpirationDate] = visaExpiration
        }

        return VaultData(dataMap)
    }

    fun formatAfterDecryption(data: VaultData, locale: FootprintSupportedLocale): VaultData {
        val dataMap = data.asMap().toMutableMap()
        var dob = dataMap[DataIdentifier.idDob]
        var visaExpiration = dataMap[DataIdentifier.idVisaExpirationDate]

        if (dob != null && dob is String) {
            dob = fromISO8601ToUsDate(dob)
            dob = fromUsDateToStringInput(locale, dob)
            dataMap[DataIdentifier.idDob] = dob
        }

        if (visaExpiration != null && visaExpiration is String) {
            visaExpiration = fromISO8601ToUsDate(visaExpiration)
            visaExpiration = fromUsDateToStringInput(locale, visaExpiration)
            dataMap[DataIdentifier.idVisaExpirationDate] = visaExpiration
        }

        return VaultData(dataMap)
    }
}