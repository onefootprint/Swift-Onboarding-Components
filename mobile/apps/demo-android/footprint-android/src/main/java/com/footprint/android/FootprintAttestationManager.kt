package com.footprint.android

import FootprintLogger
import android.annotation.SuppressLint
import android.content.Context
import android.media.MediaDrm
import android.os.Build
import android.provider.Settings
import androidx.annotation.RequiresApi
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.IntegrityTokenRequest
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID
import okhttp3.Call
import okhttp3.Callback
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import java.lang.Exception
import okio.IOException
import java.security.MessageDigest
import java.util.Base64

@Serializable
private data class AttestationChallengeRequest(
    @SerialName("device_type") val deviceType: String,
    @SerialName("package_name") val packageName: String
)

@Serializable
private data class AttestationChallenge(
    @SerialName("attestation_challenge") val challenge: String,
    val state: String
)

@Serializable
private data class AttestationResult(
    val attestation: String,
    val state: String
)

private fun ByteArray.toHex(): String = joinToString(separator = "") {
    eachByte -> "%02x".format(eachByte)
}

private data class WidevineInfo(
    val id: String,
    val level: String
)

@Serializable
private data class DataToAttest (
    val attestedChallenge: String,
    val webauthnDeviceResponseJson: String?,
    val widevineId: String?,
    val widevineSecurityLevel: String?,
    val model: String?,
    val manufacturer: String?,
    val os: String?,
    val androidId: String?
)

@Serializable
private data class AttestationPayload (
    val metadataJsonData: String,
    val attestationData: String
)

@RequiresApi(Build.VERSION_CODES.O)
private fun ByteArray.toBase64(): String =
    String(Base64.getEncoder().encode(this))

@RequiresApi(Build.VERSION_CODES.O)
private fun ByteArray.toBase64Url(): String =
    String(Base64.getUrlEncoder().encode(this))

@RequiresApi(Build.VERSION_CODES.O)
internal class FootprintAttestationManager(
    private val logger: FootprintLogger,
    private val context: Context
) {
    @SuppressLint("HardwareIds")
    private fun generateAttestation(
        deviceResponse: String,
        challenge: AttestationChallenge,
        cloudProjectNumber: Long,
        onDone: (String?) -> Unit,
    ) {
        val wv = getWidevine()
        val data = DataToAttest(
            attestedChallenge = challenge.challenge,
            webauthnDeviceResponseJson = deviceResponse,
            widevineId = wv.id,
            widevineSecurityLevel = wv.level,
            androidId = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ANDROID_ID
            ),
            model = Build.MODEL,
            manufacturer = Build.MANUFACTURER,
            os = "${Build.VERSION.SDK_INT}"
        )

        // serialize our client data
        val encodedData = Json.encodeToString(data).toByteArray()
        val md = MessageDigest.getInstance("SHA-256")
        val clientDataHash = md.digest(encodedData).toBase64Url()

        val nonce: String = clientDataHash
        val integrityManager = IntegrityManagerFactory.create(context)
        integrityManager.requestIntegrityToken(
            IntegrityTokenRequest.builder()
                .setNonce(nonce)
                .setCloudProjectNumber(cloudProjectNumber)
                .build())
            .addOnSuccessListener { response ->
                val payload = AttestationPayload(
                    metadataJsonData = encodedData.toBase64(),
                    attestationData = response.token()
                )
                val encodedPayload = Json.encodeToString(payload).toByteArray().toBase64()
                onDone(encodedPayload)
            }.addOnFailureListener{ failure ->
                logger.logWarn("Got exception while attesting device: $failure")
                onDone(null)
            }
    }

    private fun getWidevine(): WidevineInfo {
        val widevine = UUID.fromString("edef8ba9-79d6-4ace-a3c8-27dcd51d21ed")
        val wv = MediaDrm(widevine)
        val wvId = wv.getPropertyByteArray("deviceUniqueId")
        val wvLevel = wv.getPropertyString("securityLevel")
        return WidevineInfo(id = wvId.toHex(), level = wvLevel)
    }

    private fun buildAttestationChallengeRequest(authToken: String): Request {
        val requestBody = AttestationChallengeRequest(deviceType = "android", packageName = context.packageName)
        return Request.Builder()
            .url("${FootprintSdkMetadata.apiBaseUrl}/hosted/user/attest_device/challenge")
            .header("x-fp-authorization", authToken)
            .header("Content-Type", "application/json")
            .post(Json.encodeToString(requestBody).toRequestBody())
            .build()
    }

    private fun requestAttestationChallenge(
        authToken: String,
        onDone: (AttestationChallenge?) -> Unit,
    ) {
        val request = buildAttestationChallengeRequest(authToken)
        FootprintHttpClient.client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                logger.logWarn("Requesting device attestation failed. $e");
                onDone(null)
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    var responseObject: AttestationChallenge? = null;
                    if (it.isSuccessful) {
                        try {
                            responseObject =
                                Json.decodeFromString<AttestationChallenge>(it.body?.string() ?: "")
                        } catch (e: Exception) {
                            logger.logWarn("Parsing attestation challenge failed. $e")
                        }
                    } else {
                        logger.logWarn("Request device attestation failed with ${it.code} ${it.body.toString()}");
                    }
                    onDone(responseObject)
                }
            }
        })
    }

    private fun buildAttestationRequest(
        authToken: String,
        attestation: AttestationResult
    ): Request {
        return Request.Builder()
            .url("${FootprintSdkMetadata.apiBaseUrl}/hosted/user/attest_device")
            .header("x-fp-authorization", authToken)
            .header("Content-Type", "application/json")
            .post(Json.encodeToString(attestation).toRequestBody())
            .build()
    }

    private fun submitAttestation(authToken: String, attestation: AttestationResult) {
        val request = buildAttestationRequest(authToken, attestation)
        FootprintHttpClient.client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                logger.logWarn("Submitting device attestation failed");
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (!it.isSuccessful) {
                        logger.logWarn("Submitting device attestation failed with ${it.code} ${it.body.toString()}");
                    }
                }
            }
        })
    }

    fun getAttestation(deviceResponse: String?, authToken: String?, cloudProjectNumber: Long?, onDone: () -> Unit) {
        if (deviceResponse.isNullOrEmpty() || authToken.isNullOrEmpty() || cloudProjectNumber == null ) {
            onDone()
            return;
        }
        // Attempt to do a device attestation. The attestation process involves a few steps:
        // 1. request attestation challenge from backend using the result
        // 2. generate a challenge response
        // 3. submit the response to the backend
        // Trigger onDone when the response is submitted. No need to block on waiting for response.
        requestAttestationChallenge(authToken) { receivedChallenge ->
            receivedChallenge?.let { challenge ->
                generateAttestation(deviceResponse, challenge, cloudProjectNumber) { attestation ->
                    attestation?.let {
                        submitAttestation(
                            authToken,
                            AttestationResult(attestation, challenge.state)
                        )
                    }
                    // Safe to call onSubmit once the request is enqueued. We don't care for the response.
                    onDone()
                }
            } ?: run {
                onDone() // Cannot do attestation, move on
            }
        }
    }
}