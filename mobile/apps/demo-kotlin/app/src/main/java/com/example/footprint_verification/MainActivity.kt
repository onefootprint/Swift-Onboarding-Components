package com.example.footprint_verification

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import com.footprint.kotlin.FootprintKotlin
import com.footprint.kotlin.FootprintAppearance
import com.footprint.kotlin.FootprintAppearanceRules
import com.footprint.kotlin.FootprintAppearanceTheme
import com.footprint.kotlin.FootprintAppearanceVariables
import com.footprint.kotlin.FootprintConfig
import com.footprint.kotlin.FootprintL10n
import com.footprint.kotlin.FootprintOptions
import com.footprint.kotlin.FootprintSupportedLocale
import com.footprint.kotlin.FootprintUserData

class MainActivity : AppCompatActivity() {
    private lateinit var verificationButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        verificationButton = findViewById(R.id.verify_button)
        verificationButton.setOnClickListener {
            val userData = FootprintUserData(
                email = "example@gmail.com",
                phoneNumber = "+15555550100",
                firstName = "Piip",
                lastName = "Foot",
                dob = "01/01/1996",
                addressLine1 = "123 Main St",
                addressLine2 = "Unit 123",
                city = "Huntington Beach",
                state = "CA",
                country = "US",
                zip = "12345",
                ssn9 = "343434344",
                ssn4 = "1234",
                nationality = "US",
                usLegalStatus = "citizen",
                citizenships = listOf("US", "TR"),
                visaKind = "f1",
                visaExpirationDate = "05/12/2024"
            )
            val config = FootprintConfig(
                redirectActivityName = "com.example.footprint_verification.MainActivity",
                publicKey = "pb_test_aSzwnZecnXS4faoyhxrocW",
                userData = userData,
                options = FootprintOptions(showLogo = true),
                l10n = FootprintL10n(locale = FootprintSupportedLocale.ES_MX),
                appearance = FootprintAppearance(
                    theme = FootprintAppearanceTheme.DARK,
                    rules = FootprintAppearanceRules(button = mapOf("transition" to "all .2s linear")),
                    variables = FootprintAppearanceVariables(borderRadius = "10px", buttonPrimaryBg = "#0C6948")
                ),
                onComplete = {token: String ->
                    Log.d("VerificationResult", "The flow has completed. The validation token is $token")
                },
                onCancel = {
                    Log.d("VerificationResult", "The flow was canceled")
                },
                onError = {
                    Log.d("Footprint error", it)
                }
            )
            FootprintKotlin.init(
                this@MainActivity,
                config = config
            )
        }
    }
}