package com.onefootprint.native_onboarding_components.utils

import com.onefootprint.native_onboarding_components.FootprintQueries
import com.onefootprint.native_onboarding_components.models.FootprintException
import com.onefootprint.native_onboarding_components.models.FootprintSupportedLocale
import org.openapitools.client.models.DataIdentifier
import org.openapitools.client.models.VaultData

internal object VaultUtils {
    suspend fun vaultData(data: VaultData, authToken: String?, locale: FootprintSupportedLocale){
        if (authToken == null) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.VAULTING_ERROR,
                message = "Could not vault data without an authToken"
            )
        }
        val formattedData = Formatters.formatBeforeSave(data, locale)
        FootprintQueries.vault(
            authToken = authToken,
            vaultData = formattedData,
        )
    }

    suspend fun decryptVaultData(authToken: String?, fields: List<DataIdentifier>, locale: FootprintSupportedLocale): VaultData {
        if (authToken == null ) {
            throw FootprintException(
                kind = FootprintException.ErrorKind.DECRYPTION_ERROR,
                message = "Could not decrypt vault data without an authToken"
            )
        }
        val vaultData = FootprintQueries.decrypt(
            authToken = authToken,
            fields = fields
        )
        return Formatters.formatAfterDecryption(vaultData, locale)
    }
}