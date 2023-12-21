package com.example.foortpint_verification

import android.net.Uri
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import com.footprint.verify.Footprint
import com.footprint.verify.FootprintUserData

class MainActivity : AppCompatActivity() {
    private lateinit var verificationButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val userData = FootprintUserData(email = "test@email.com", phoneNumber = ("+1 (555) 555-0100"))
        val onComplete: (String) -> Unit = {token: String ->
            Log.d("VerificationResult", "The flow has completed. The validation token is $token")
        }
        val onClose: () -> Unit = {
            Log.d("VerificationResult", "The flow has been closed prematuredly")
        }
        val onCancel: () -> Unit = {
            Log.d("VerificationResult", "The flow has canceled")
        }

        val footprint = Footprint.getInstance()
        footprint.setParams(
            "com.example.foortpint_verification.MainActivity",
            publicKey = "pb_test_aSzwnZecnXS4faoyhxrocW",
            userData = userData,
            onComplete = onComplete,
            onCancel = onCancel,
            onClose = onClose
        )

        verificationButton = findViewById(R.id.verify_button)
        verificationButton.setOnClickListener {
            footprint.startVerification(this@MainActivity);
        }

        val extras: Bundle? = intent.extras
        Log.d("VerificationResult", "The bundle data: ${extras?.getString("verificationResult")}")
    }
}