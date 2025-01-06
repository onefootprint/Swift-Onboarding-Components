package com.onefootprint.native_onboarding_components.validations

import com.onefootprint.native_onboarding_components.models.FootprintSupportedLocale
import com.onefootprint.native_onboarding_components.models.Translation
import kotlinx.datetime.*
import kotlinx.datetime.TimeZone

object DateOfBirthValidator {
    const val DOB_MIN_AGE = 18
    const val DOB_MAX_AGE = 120

    enum class Locale(val format: String) {
        EN_US("MM/dd/yyyy"),
        OTHER("dd/MM/yyyy")
    }

    private fun getDateComponents(
        date: String,
        locale: Locale
    ): Map<String, String> {
        val parts = date.split("/")
        if (parts.size != 3) return mapOf("day" to "", "month" to "", "year" to "")

        val dayIndex = if (locale == Locale.EN_US) 1 else 0
        val monthIndex = if (locale == Locale.EN_US) 0 else 1
        val yearIndex = 2

        return mapOf(
            "day" to parts.getOrNull(dayIndex).orEmpty(),
            "month" to parts.getOrNull(monthIndex).orEmpty(),
            "year" to parts.getOrNull(yearIndex).orEmpty()
        )
    }

    private fun validateDateComponents(components: Map<String, String>): Boolean {
        val day = components["day"]?.toIntOrNull()
        val month = components["month"]?.toIntOrNull()
        val year = components["year"]?.toIntOrNull()

        return day in 1..31 &&
                month in 1..12 &&
                year != null &&
                components["year"]?.length == 4
    }

    private fun calculateAge(
        birthDate: LocalDate,
        today: LocalDate = Clock.System.now().toLocalDateTime(TimeZone.UTC).date
    ): Int {
        return today.year - birthDate.year
    }

    fun validateDob(
        dob: String,
        locale: FootprintSupportedLocale,
        translation: Translation? = null
    ): String? {
        if (dob.isBlank()) {
            return translation?.dob?.required ?: "Date of birth is required"
        }

        val dateFormat = when (locale) {
            FootprintSupportedLocale.en_US -> Locale.EN_US
            FootprintSupportedLocale.es_MX -> Locale.OTHER
        }

        val today = Clock.System.now().toLocalDateTime(TimeZone.UTC).date
        val dateComponents = getDateComponents(dob, dateFormat)

        if (!validateDateComponents(dateComponents)) {
            val correctFormat = dateFormat.format
            return translation?.dob?.invalid ?: "Invalid date format. Please use $correctFormat"
        }

        val paddedDay = dateComponents["day"]!!.padStart(2, '0')
        val paddedMonth = dateComponents["month"]!!.padStart(2, '0')
        val year = dateComponents["year"]!!

        val isoFormatDate = "$year-$paddedMonth-$paddedDay"

        val date: LocalDate = try {
            LocalDate.parse(isoFormatDate)
        } catch (e: Exception) {
            return translation?.dob?.invalid ?: "Invalid date"
        }

        val age = calculateAge(date, today)

        return when {
            age < DOB_MIN_AGE -> translation?.dob?.tooYoung
                ?: "Too young. Minimum age is $DOB_MIN_AGE"

            age > DOB_MAX_AGE -> translation?.dob?.tooOld ?: "Too old. Maximum age is $DOB_MAX_AGE"
            date > today -> translation?.dob?.inTheFuture
                ?: "In the future. Please use a valid date"

            else -> null
        }
    }
}