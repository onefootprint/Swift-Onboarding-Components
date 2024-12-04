package com.onefootprint.native_onboarding_components

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.onefootprint.native_onboarding_components.hosted.FootprintAppearance
import com.onefootprint.native_onboarding_components.hosted.FootprintAppearanceRules
import com.onefootprint.native_onboarding_components.hosted.FootprintAppearanceVariables
import com.onefootprint.native_onboarding_components.hosted.FootprintHosted
import com.onefootprint.native_onboarding_components.models.DocumentOutcome
import com.onefootprint.native_onboarding_components.models.OverallOutcome
import com.onefootprint.native_onboarding_components.models.SandboxOutcome
import kotlinx.coroutines.launch

// ViewModel class to manage validation tokens
class OnboardingViewModel(private val savedStateHandle: SavedStateHandle) : ViewModel() {
    var identifyValidationToken: String? = savedStateHandle["identifyValidationToken"]
    var handoffValidationToken: String? = savedStateHandle["handoffValidationToken"]

    fun saveIdentifyValidationToken(token: String) {
        identifyValidationToken = token
        savedStateHandle["identifyValidationToken"] = token
    }

    fun saveHandoffValidationToken(token: String) {
        handoffValidationToken = token
        savedStateHandle["handoffValidationToken"] = token
    }
}

// ViewModelFactory to create the ViewModel with SavedStateHandle
class OnboardingViewModelFactory(
    private val savedStateHandle: SavedStateHandle
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(OnboardingViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return OnboardingViewModel(savedStateHandle) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

// MainActivity
class MainActivity : ComponentActivity() {

    // Get the ViewModel instance with the factory that includes SavedStateHandle
    private val onboardingViewModel: OnboardingViewModel by viewModels {
        OnboardingViewModelFactory(SavedStateHandle()) // passing SavedStateHandle here
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            FootprintInitializeScreen(onboardingViewModel)
        }
    }
}

// Composable function to initialize Footprint SDK and display validation tokens
@Composable
fun FootprintInitializeScreen(onboardingViewModel: OnboardingViewModel) {
    // Remember the coroutine scope to launch the initialization in the right scope
    val coroutineScope = rememberCoroutineScope()

    // State to handle feedback message
    var feedbackMessage by remember { mutableStateOf("") }

    // Get the current context
    val context = LocalContext.current

    Column {
        // Button to initialize Footprint SDK
        Button(onClick = {
            // Show loading feedback
            feedbackMessage = "Initializing Footprint..."

            // Launch coroutine to initialize Footprint SDK
            coroutineScope.launch {
                try {
                    // Initialize Footprint SDK
                    Footprint.initialize(
                        publicKey = "pb_test_aSzwnZecnXS4faoyhxrocW",
                        sandboxOutcome = SandboxOutcome(
                            overallOutcome = OverallOutcome.PASS,
                            documentOutcome = DocumentOutcome.FAIL
                        )
                    )
                    // After initialization, show success message
                    feedbackMessage = "Footprint initialized successfully!"
                } catch (e: Exception) {
                    // Handle initialization error and show error feedback
                    feedbackMessage = "Initialization failed: ${e.message}"
                }
            }
        }) {
            Text("Initialize Footprint")
        }

        // Display the feedback message
        Spacer(modifier = Modifier.height(16.dp))
        Text(feedbackMessage)

        // Button to launch Identify process
        Button(onClick = {
            // Launch the identify process
            coroutineScope.launch {
                FootprintHosted.launchIdentify(
                    redirectActivityName = "com.onefootprint.native_onboarding_components.MainActivity",
                    context = context, // Using LocalContext here inside a composable
                    email = "example@gmail.com",
                    phone = "+15555550100",
                    onCancel = {
                        println("Cancelled")
                    },
                    onError = {
                        println("Error occurred")
                    },
                    onAuthenticated = { response ->
                        // Save validation token from the identify process in ViewModel
                        onboardingViewModel.saveIdentifyValidationToken(response.validationToken)
                        println("Validation token after launch identify ${response.validationToken}")
                    },
                    appearance = FootprintAppearance(
                        rules = FootprintAppearanceRules(button = mapOf("transition" to "all .2s linear")),
                        variables = FootprintAppearanceVariables(borderRadius = "10px", buttonPrimaryBg = "#0C6948")
                    )
                )
            }
        }) {
            Text("Launch Identify")
        }

        // Display validation token after Identify process
        onboardingViewModel.identifyValidationToken?.let {
            Text("Identify Validation Token: $it")
        }

        // Spacer
        Spacer(modifier = Modifier.height(16.dp))

        // Button to launch Handoff process
        Button(onClick = {
            // Launch the handoff process
            coroutineScope.launch {
                FootprintHosted.handoff(
                    redirectActivityName = "com.onefootprint.native_onboarding_components.MainActivity",
                    context = context, // Using LocalContext here inside a composable
                    onCancel = {
                        println("Cancelled")
                    },
                    onError = {
                        println("Error occurred")
                    },
                    onComplete = { token ->
                        // Save validation token from the handoff process in ViewModel
                        onboardingViewModel.saveHandoffValidationToken(token)
                        println("Onboarding complete! Validation token $token")
                    },
                    appearance = FootprintAppearance(
                        rules = FootprintAppearanceRules(button = mapOf("transition" to "all .2s linear")),
                        variables = FootprintAppearanceVariables(borderRadius = "10px", buttonPrimaryBg = "#0C6948")
                    )
                )
            }
        }) {
            Text("Launch Handoff")
        }

        // Display validation token after Handoff process
        onboardingViewModel.handoffValidationToken?.let {
            Text("Handoff Validation Token: $it")
        }
    }
}
