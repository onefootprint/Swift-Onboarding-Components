package com.onefootprint.native_onboarding_components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.Button
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.sp
import com.onefootprint.native_onboarding_components.models.FootprintException
import org.jetbrains.compose.ui.tooling.preview.Preview
import org.openapitools.client.models.PublicOnboardingConfiguration

@Composable
@Preview
fun TestUi() {
    MaterialTheme {
        var showContent by remember { mutableStateOf(false) }
        Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
            Button(onClick = { showContent = !showContent }) {
                Text("Click me!")
            }
            AnimatedVisibility(showContent) {
                var onboardingConfig by remember { mutableStateOf<PublicOnboardingConfiguration?>(null)}
                LaunchedEffect(Unit) {
                    try {
                    val onboardingConfiguration = Greeting().getOnboardingConfig()
                        onboardingConfig = onboardingConfiguration
                    }catch (e: FootprintException){
                        println("error toString: ${e.toString()}")
                        println("error kind: ${e.kind}")
                        println("error message: ${e.message}")
                        println("error supportID: ${e.supporId}")
                    }
                }
                Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Onboarding config data",fontSize = 24.sp )
                    Text("Name: ${onboardingConfig?.name}")
                    Text("orgName: ${onboardingConfig?.orgName}")
                    Text("Key: ${onboardingConfig?.key}")

                }
            }
        }
    }
}