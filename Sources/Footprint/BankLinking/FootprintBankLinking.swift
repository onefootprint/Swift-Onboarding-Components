//
//  FootprintBankLinking.swift
//  Footprint
//
//  Created by D M Raisul Ahsan on 4/21/25.
//
import SwiftUI
import SwiftOnboardingComponentsShared

public struct BankLinkingCompletionResponse {
    public let validationToken: String
    public let meta: BankLinkingCompletionMeta
}

public struct FootprintBankLinking: View {
    private let authToken: String
    private var onSuccess: ((BankLinkingCompletionResponse) -> Void)? = nil
    private var onError: ((FootprintException) -> Void)? = nil
    private var onClose: (() -> Void)? = nil
    private var onEvent: ((FootprintBankLinkingEvent) -> Void)? = nil
    private var sessionId: String? = nil
    private let redirectUri: String
    @State private var initialized: Bool = false
    @State private var bankLinkingMeta: BankLinkingCompletionMeta? = nil
    @State private var showBankLinking: Bool = false
    
    public init(
        authToken: String,
        redirectUri: String,
        onSuccess: ((BankLinkingCompletionResponse) -> Void)? = nil,
        onError: ((FootprintException) -> Void)? = nil,
        onClose: (() -> Void)? = nil,
        onEvent: ((FootprintBankLinkingEvent) -> Void)? = nil,
        sessionId: String? = nil
    ) {
        self.authToken = authToken
        self.redirectUri = redirectUri
        self.onSuccess = onSuccess
        self.onError = onError
        self.onClose = onClose
        self.onEvent = onEvent
        self.sessionId = sessionId
    }
    
    func logError(_ error: Error) {
        Task.detached {
            let footprintError = (error as? FootprintException) ?? FootprintException(
                kind: FootprintException.ErrorKind.bankLinkingError,
                message: error.localizedDescription,
                supportId: nil,
                sessionId: sessionId,
                context: nil,
                code: nil
            )
            await Footprint.shared.logError(error: footprintError)
        }
    }
    
    public var body: some View {
        VStack(spacing: 16) {
            if(showBankLinking){
                FootprintBankLinkingInternal(
                    redirectUri: self.redirectUri,
                    onSuccess: { meta in
                        showBankLinking = false
                        bankLinkingMeta = meta
                    },
                    onError: { error in
                        showBankLinking = false
                        self.onError?(error)
                    },
                    onClose: {
                        showBankLinking = false
                        self.onClose?()
                    },
                    onEvent: self.onEvent
                )
            }else{
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle())
                    .scaleEffect(1.5)
            }
        }
        .onChange(of: bankLinkingMeta) { meta in
            guard let meta = meta else { return }
            Task {
                do {
                    while true {
                        let result = try await Footprint.shared.processBankLinking()
                        switch result {
                        case .complete(let validationToken):
                            self.onSuccess?(
                                BankLinkingCompletionResponse(
                                    validationToken: validationToken,
                                    meta: meta
                                )
                            )
                            return
                        case .sleepRequired(let seconds):
                            try await Task.sleep(nanoseconds: UInt64(seconds) * 1_000_000_000)
                        }
                    }
                } catch {
                    let footprintError = (error as? FootprintException) ?? FootprintException(
                        kind: FootprintException.ErrorKind.bankLinkingError,
                        message: error.localizedDescription,
                        supportId: nil,
                        sessionId: sessionId,
                        context: nil,
                        code: nil
                    )
                    
                    logError(error)
                    onError?(footprintError)
                }
            }
        }
        .onChange(of: initialized) { isInitialized in
            if isInitialized {
                showBankLinking = true
            }
        }
        .onAppear {
            Task {
                do {
                    try await Footprint.shared.initializeWithAuthToken(
                        authToken: authToken,
                        sessionId: sessionId
                    )
                    initialized = true
                } catch {
                    let footprintError = (error as? FootprintException) ?? FootprintException(
                        kind: FootprintException.ErrorKind.bankLinkingError,
                        message: error.localizedDescription,
                        supportId: nil,
                        sessionId: sessionId,
                        context: nil,
                        code: nil
                    )
                    
                    logError(error)
                    onError?(footprintError)
                }
            }
        }
    }
    
    public static func handleRedirectURL(_ url: URL) {
        FootprintBankLinkingInternal.handleRedirectURL(url)
    }
}
