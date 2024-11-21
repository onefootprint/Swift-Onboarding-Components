package com.onefootprint.native_onboarding_components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.runBlocking
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
@Preview
fun TestUi() {
    MaterialTheme {
        var showVerificationInput by remember { mutableStateOf(false) }
        var verificationCode by remember { mutableStateOf("") }
        var initializationMessage by remember { mutableStateOf<String?>(null) }
        var verificationResponseMessage by remember { mutableStateOf<String?>(null) }

        Column(
            Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Display initialization message
            initializationMessage?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.body1,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }

            // Button to toggle verification input visibility
            Button(onClick = { showVerificationInput = !showVerificationInput }) {
                Text("Toggle Verification Input")
            }

            // Verification input and button
            AnimatedVisibility(visible = showVerificationInput) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    OutlinedTextField(
                        value = verificationCode,
                        onValueChange = { verificationCode = it },
                        label = { Text("Enter Verification Code") },
                        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
                    )
                    Button(onClick = {
                        try {
                            runBlocking {
                                val response = Footprint.verify(verificationCode = verificationCode)
                                verificationResponseMessage = "Verification successful: ${response.validationToken}"
                            }
                        } catch (e: Exception) {
                            verificationResponseMessage = "Verification failed: ${e.message}"
                        }
                    }) {
                        Text("Verify Code")
                    }
                }
            }

            // Display verification response
            verificationResponseMessage?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.body2,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
        }

        // Run initialization logic on mount
        LaunchedEffect(Unit) {
            try {
                val response = Footprint.initialize(publicKey = "pb_test_Uc3tXMWyn9XR53Mng1KnZl")
                println("" + response.requiresAuth + ", " + response.authMethod)
                val createChallengeResponse = Footprint.createChallenge(
                    email = "raisul.ahsan.ahsan@gmail.com",
                    phoneNumber = "+15055079015"
                )
                println("Create challenge response: $createChallengeResponse")
                initializationMessage = "Initialization completed successfully!"
            } catch (e: Exception) {
                println("Initialization failed: ${e.message}")
                initializationMessage = "Initialization failed: ${e.message}"
            }
        }
    }
}
