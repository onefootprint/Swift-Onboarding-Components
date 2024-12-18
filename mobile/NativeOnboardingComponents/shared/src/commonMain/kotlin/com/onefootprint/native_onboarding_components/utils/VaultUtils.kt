package com.onefootprint.native_onboarding_components.utils

import com.onefootprint.native_onboarding_components.FootprintQueries
import com.onefootprint.native_onboarding_components.models.FootprintException
import com.onefootprint.native_onboarding_components.models.FootprintSupportedLocale
import com.onefootprint.native_onboarding_components.models.VaultData
import org.openapitools.client.models.DataIdentifier

internal object VaultUtils {
    suspend fun vaultData(data: VaultData, authToken: String?, locale: FootprintSupportedLocale){
        if (authToken == null) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.VAULTING_ERROR,
                message = "Could not vault data without an authToken"
            )
        }
        val formattedData = Formatters.formatBeforeSave(data, locale)
        val modernRawUserDataRequest = formattedData.toModernRawUserDataRequest()
        FootprintQueries.vault(
            authToken = authToken,
            vaultData = modernRawUserDataRequest,
        )
    }

    suspend fun decryptVaultData(authToken: String?, fields: List<DataIdentifier>, locale: FootprintSupportedLocale): VaultData {
        if (authToken == null ) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.DECRYPTION_ERROR,
                message = "Could not decrypt vault data without an authToken"
            )
        }
        val vaultDataResponse = FootprintQueries.decrypt(
            authToken = authToken,
            fields = fields
        )
        val vaultData = VaultData.fromModernUserDecryptResponse(vaultDataResponse)
        return Formatters.formatAfterDecryption(vaultData, locale)
    }
}