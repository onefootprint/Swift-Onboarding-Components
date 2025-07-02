//
//  BankLinkingCompletionMeta.swift
//  Footprint
//
//  Created by D M Raisul Ahsan on 7/1/25.
//

import MoneyKit

public struct BankLinkingCompletionMeta {
    public let accounts: [FootprintBankLinkingAccount]
    public let institution: FootprintBankLinkingInstitution
    public let trackedScreens: [FootprintBankLinkingTrackedScreen]
}


private func createBankLinkingCompletionMeta(
    accounts: [MKAccount],
    trackedScreens: [MKTrackedScreen],
    institution: MKInstitution
) -> BankLinkingCompletionMeta {
    
    let fpAccounts = accounts.map { account in
        return FootprintBankLinkingAccount(
            id: account.id,
            name: account.name,
            type: account.name,
            mask: account.mask
        )
    }
    
    let fpTrackedScreens = trackedScreens.map { trackedScreen in
        return FootprintBankLinkingTrackedScreen(
            name: trackedScreen.name,
            duration: trackedScreen.duration,
            gameTime: trackedScreen.gameTime,
            requestTime: trackedScreen.requestTime
        )
    }
    
    let fpInstitution = FootprintBankLinkingInstitution(
        id: institution.id,
        name: institution.name,
        domain: institution.domain
    )
    
    return BankLinkingCompletionMeta(
        accounts: fpAccounts,
        institution: fpInstitution,
        trackedScreens: fpTrackedScreens
    )
}

func getBankLinkingCompletionMetaFromLinked(institution: MKLinkedInstitution) -> BankLinkingCompletionMeta {
    return createBankLinkingCompletionMeta(
        accounts: institution.accounts,
        trackedScreens: institution.trackedScreens,
        institution: institution.institution
    )
}

func getBankLinkingCompletionMetaFromRelinked(institution: MKRelinkedInstitution) -> BankLinkingCompletionMeta {
    return createBankLinkingCompletionMeta(
        accounts: institution.accounts,
        trackedScreens: institution.trackedScreens,
        institution: institution.institution
    )
}
