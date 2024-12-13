import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.plugin.mpp.apple.XCFramework

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidLibrary)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.composeCompiler)
    alias(libs.plugins.kotlinSerialization)
    id("maven-publish") // Add maven-publish plugin
}

version = "1.0.0-beta"
group = "com.onefootprint.native_onboarding_components"


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
    publishing {
        singleVariant("release") {
            withSourcesJar()
        }
    }
}

dependencies {
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.material)
    implementation(libs.androidx.activity)
}

// Configure publishing for Android AAR
publishing {
    repositories {
        maven {
            name = "local"
            url = uri("$buildDir/repo")
        }
    }
    publications {
        create<MavenPublication>("release") {
            groupId = group.toString()
            artifactId = "native-onboarding-components"
            version = project.version.toString()

            // Publish AAR file
            artifact("$buildDir/outputs/aar/${project.name}-release.aar")

            // Sources JAR
            artifact(tasks.register<Jar>("sourceJar") {
                from(android.sourceSets["main"].java.srcDirs)
                archiveClassifier.set("sources")
            })

            // Customize the POM
            pom {
                withXml {
                    val dependenciesNode = asNode().appendNode("dependencies")
                    configurations["api"].allDependencies.forEach {
                        val dependencyNode = dependenciesNode.appendNode("dependency")
                        dependencyNode.appendNode("groupId", it.group)
                        dependencyNode.appendNode("artifactId", it.name)
                        dependencyNode.appendNode("version", it.version)
                    }
                }
            }
        }
    }
}

afterEvaluate {
    tasks.named("publishReleasePublicationToLocalRepository") {
        dependsOn(tasks.named("bundleReleaseAar"))
    }
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

afterEvaluate {
    configure<PublishingExtension> {
        publications.all {
            val mavenPublication = this as? MavenPublication
            // Rename artifactId from the default one if needed
            if (mavenPublication?.artifactId == "shared-android") {
                mavenPublication.artifactId = "android"
            }
        }
    }
}


