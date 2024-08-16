package com.onefootprint.demo_android

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import com.footprint.android.FootprintAndroid
import com.footprint.android.FootprintAppearance
import com.footprint.android.FootprintAppearanceRules
import com.footprint.android.FootprintAppearanceVariables
import com.footprint.android.FootprintBootstrapData
import com.footprint.android.FootprintConfiguration
import com.footprint.android.FootprintL10n
import com.footprint.android.FootprintOptions
import com.footprint.android.FootprintSupportedLocale

class MainActivity : AppCompatActivity() {
    private lateinit var verificationButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        verificationButton = findViewById(R.id.verify_button)
        verificationButton.setOnClickListener {
            val bootstrapData = FootprintBootstrapData(
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
                visaExpirationDate = "05/12/2024",
                businessAddressLine1 = "1 Main St",
                businessAddressLine2 = "Apt 10",
                businessCity = "San Francisco",
                businessState = "CA",
                businessCountry = "US",
                businessCorporationType = "llc",
                businessDba = "Test",
                businessName = "Acme",
                businessPhoneNumber = "+15555550100",
                businessTin = "12-3456789",
                businessWebsite = "test.test.com",
                businessZip = "94107"
            )
            val config = FootprintConfiguration(
                redirectActivityName = "com.onefootprint.demo_android.MainActivity",
                publicKey = "pb_test_pZoERpZeZkGW7RRVeBawSm", // KYB pb_key to test all bootstrap data
                bootstrapData = bootstrapData,
                options = FootprintOptions(showLogo = true),
                l10n = FootprintL10n(locale = FootprintSupportedLocale.ES_MX),
                appearance = FootprintAppearance(
                    rules = FootprintAppearanceRules(button = mapOf("transition" to "all .2s linear")),
                    variables = FootprintAppearanceVariables(borderRadius = "10px", buttonPrimaryBg = "#0C6948")
                ),
                cloudProjectNumber = 53589614945,
                onComplete = {token: String ->
                    Log.d("Footprint", "The flow has completed. The validation token is $token")
                },
                onCancel = {
                    Log.d("Footprint", "The flow was canceled")
                },
                onError = {
                    Log.d("Footprint", it)
                }
            )
            FootprintAndroid.init(
                this@MainActivity,
                config = config
            )
        }
    }
}