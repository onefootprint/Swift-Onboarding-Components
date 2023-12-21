package com.example.footprint_verification

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import com.footprint.verify.Footprint
import com.footprint.verify.FootprintConfig
import com.footprint.verify.FootprintL10n
import com.footprint.verify.FootprintOptions
import com.footprint.verify.FootprintSupportedLocale
import com.footprint.verify.FootprintUserData

class MainActivity : AppCompatActivity() {
    private lateinit var verificationButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        verificationButton = findViewById(R.id.verify_button)
        verificationButton.setOnClickListener {
            val config = FootprintConfig(
                destinationActivityName = "com.example.footprint_verification.MainActivity",
                publicKey = "pb_test_aSzwnZecnXS4faoyhxrocW",
                userData = FootprintUserData(email = "test@email.com", phoneNumber = ("+15555550100")),
                options = FootprintOptions(showLogo = true),
                l10n = FootprintL10n(locale = FootprintSupportedLocale.ES_MX),
                onComplete = {token: String ->
                    Log.d("VerificationResult", "The flow has completed. The validation token is $token")
                },
                onCancel = {
                    Log.d("VerificationResult", "The flow was canceled")
                }
            )
            Footprint.init(
                this@MainActivity,
                config = config
            )
        }

        val extras: Bundle? = intent.extras
        Log.d("VerificationResult", "The bundle data: ${extras?.getString("verificationResult")}")
    }
}