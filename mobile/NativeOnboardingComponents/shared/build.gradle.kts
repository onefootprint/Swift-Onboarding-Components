import com.vanniktech.maven.publish.SonatypeHost
import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.plugin.mpp.apple.XCFramework

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidLibrary)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.composeCompiler)
    alias(libs.plugins.kotlinSerialization)
    id("com.vanniktech.maven.publish") version "0.28.0"
}

kotlin {
    androidTarget {
        @OptIn(ExperimentalKotlinGradlePluginApi::class)
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_11)
        }
        publishLibraryVariants("release")
    }

    val xcframeworkName = "SwiftOnboardingComponentsShared"
    val xcf = XCFramework(xcframeworkName)


    val isEmulatorOnly = project.findProperty("runIOSOnEmulatorOnly")?.toString()?.toBoolean() ?: false

    println("isEmulatorOnly: "+isEmulatorOnly)

    val list = if (isEmulatorOnly) {
        listOf(iosSimulatorArm64())
    } else {
        listOf(iosX64(), iosArm64(), iosSimulatorArm64())
    }

    println("list: "+list)

    list.forEach {
        it.binaries.framework {
            baseName = xcframeworkName
            binaryOption("bundleId", "com.onefootprint.${xcframeworkName}")
            xcf.add(this)
            isStatic = true
        }
    }

    sourceSets {
        androidMain.dependencies {
            implementation(compose.preview)
            implementation(libs.ktor.client.jvm)
            implementation(libs.androidx.activity.compose)
            implementation(libs.androidx.browser)
            implementation(libs.okhttp)
        }
        commonMain.dependencies {
            implementation(compose.runtime)
            implementation(compose.foundation)
            implementation(compose.material)
            implementation(compose.ui)
            implementation(compose.components.resources)
            implementation(compose.components.uiToolingPreview)
            implementation(libs.androidx.lifecycle.viewmodel)
            implementation(libs.androidx.lifecycle.runtime.compose)
            implementation(libs.kotlinx.coroutines)
            implementation(libs.kotlinx.serialization)
            implementation(libs.ktor.client.logging)

            api(libs.ktor.client.core)
            api(libs.ktor.client.serialization)
            api(libs.ktor.client.negotiation)
            api(libs.ktor.serialization.json)

            api(libs.kotlinx.datetime)
        }
        iosMain {
            dependencies {
                api(libs.ktor.client.ios)
            }
        }
    }
}

android {
    namespace = "com.onefootprint.native_onboarding_components.shared"
    compileSdk = libs.versions.android.compileSdk.get().toInt()
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    defaultConfig {
        minSdk = libs.versions.android.minSdk.get().toInt()
    }
}

dependencies {
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.material)
    implementation(libs.androidx.activity)
}

mavenPublishing {
    coordinates(
        groupId = project.findProperty("groupId") as String, // Retrieve groupId from gradle.properties
        artifactId = project.findProperty("artifactId") as String, // Retrieve artifactId from gradle.properties
        version = project.findProperty("version") as String // Retrieve version from gradle.properties
    )

    pom {
        name.set(project.findProperty("projectName") as String) // Retrieve projectName from gradle.properties
        description.set(project.findProperty("projectDescription") as String) // Retrieve projectDescription from gradle.properties

        licenses {
            license {
                name.set("The Apache Software License, Version 2.0")
                url.set("http://www.apache.org/licenses/LICENSE-2.0.txt")
            }
        }

        developers {
            developer {
                id.set(project.findProperty("ahsanId") as String) // Developer ID from gradle.properties
                name.set(project.findProperty("ahsanName") as String) // Developer name from gradle.properties
                email.set(project.findProperty("ahsanEmail") as String) // Developer email from gradle.properties
            }
            developer {
                id.set(project.findProperty("rodrigoId") as String) // Developer ID from gradle.properties
                name.set(project.findProperty("rodrigoName") as String) // Developer name from gradle.properties
                email.set(project.findProperty("rodrigoEmail") as String) // Developer email from gradle.properties
            }
        }

        url.set(project.findProperty("projectUrl") as String) // Retrieve projectUrl from gradle.properties
        scm {
            url.set(project.findProperty("scmUrl") as String) // Retrieve scmUrl from gradle.properties
        }
    }

    // Configure publishing to Maven Central
    publishToMavenCentral(SonatypeHost.CENTRAL_PORTAL)

    if (gradle.startParameter.taskNames.contains("shared:publishAndroidReleasePublicationToMavenCentralRepository")) {
        signAllPublications()
    }
}


afterEvaluate {
    tasks.register("packForXcode") {
        dependsOn("assembleSwiftOnboardingComponentsSharedXCFramework")
        doLast {
            val task = tasks.findByName("assembleSwiftOnboardingComponentsSharedReleaseXCFramework")

            // Ensure the task exists and has outputs
            val outputFile = task?.outputs?.files?.singleFile
                ?: throw IllegalStateException("Output file for assembleSwiftOnboardingComponentsSharedReleaseXCFramework task not found!")

            val targetDirectory = File("${projectDir}/../SwiftOnboardingComponents/Frameworks")

            val targetFile = targetDirectory.resolve(outputFile.name)

            outputFile.copyRecursively(targetFile, overwrite = true)
        }
    }
}


