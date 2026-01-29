//
//  FootprintBankLinkingWithAuthToken.swift
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

public struct FootprintBankLinkingWithAuthToken: View {
    private let authToken: String
    private var onSuccess: ((BankLinkingCompletionResponse) -> Void)? = nil
    private var onError: ((FootprintException) -> Void)? = nil
    private var onClose: (() -> Void)? = nil
    private var onEvent: ((FootprintBankLinkingEvent) -> Void)? = nil
    private var sessionId: String? = nil
    private let redirectUri: String
    @State private var initialized: Bool = false
    @State private var bankLinkingMeta: BankLinkingCompletionMeta? = nil
    @State private var showBankLinkingSheet: Bool = false
    
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
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle())
                .scaleEffect(1.5)
        }
        .sheet(isPresented: $showBankLinkingSheet) {
            FootprintBankLinking(
                redirectUri: self.redirectUri,
                onSuccess: { meta in
                    showBankLinkingSheet = false
                    bankLinkingMeta = meta
                },
                onError: { error in
                    showBankLinkingSheet = false
                    self.onError?(error)
                },
                onClose: {
                    showBankLinkingSheet = false
                    self.onClose?()
                },
                onEvent: self.onEvent
            )
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
                showBankLinkingSheet = true
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
}
