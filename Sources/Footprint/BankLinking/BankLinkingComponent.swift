//
//  FootprintBankLinking.swift
//  Footprint
//
//  Created by D M Raisul Ahsan on 4/18/25.
//

import MoneyKit
import SwiftUI
import SwiftOnboardingComponentsShared

public struct BankLinkingComponent: View {
    @StateObject private var connectViewModel = MKConnectViewModel()
    @State private var linkSessionToken: String? = nil
    @State private var isLoading: Bool = true
    private var onSuccess: ((BankLinkingCompletionMeta) -> Void)? = nil
    private var onError: ((FootprintException) -> Void)? = nil
    private var onClose: (() -> Void)? = nil
    private var onEvent: ((FootprintBankLinkingEvent) -> Void)? = nil
    private var redirectUri: String
    
    public init(
        redirectUri: String,
        onSuccess: ((BankLinkingCompletionMeta) -> Void)? = nil,
        onError: ((FootprintException) -> Void)? = nil,
        onClose: (() -> Void)? = nil,
        onEvent: ((FootprintBankLinkingEvent) -> Void)? = nil
    ) {
        self.onSuccess = onSuccess
        self.onError = onError
        self.onClose = onClose
        self.redirectUri = redirectUri
        self.onEvent = onEvent
    }
    
    public var body: some View {
        ZStack {
            if isLoading {
                loadingView()
            } else {
                moneyKitConnect()
            }
        }
        .padding()
        .onOpenURL { incomingURL in
            handleIncomingURL(incomingURL)
        }
        .onAppear{
            NotificationCenter.default.addObserver(
                forName: .footprintBankLinkingRedirectReceived,
                object: nil,
                queue: .main
            ) { notification in
                if let url = notification.userInfo?["url"] as? URL {
                    Task { @MainActor in
                        handleIncomingURL(url)
                    }
                }
            }
            
            Task {
                do {
                    linkSessionToken = try await Footprint.shared.getMoneyKitLinkSessionToken(redirectUri: redirectUri)
                    isLoading = false
                } catch {
                    handleError(error)
                }
            }
        }
    }
    
    public static func handleRedirectURL(_ url: URL) {
        NotificationCenter.default.post(
            name: .footprintBankLinkingRedirectReceived,
            object: nil,
            userInfo: ["url": url]
        )
    }
}

extension BankLinkingComponent {
    private func loadingView() -> some View {
        VStack(spacing: 16) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle())
                .scaleEffect(1.5)
        }
    }
    
    private func moneyKitConnect() -> some View {
        guard let sessionToken = linkSessionToken else {
            // If for some reason we get here without a token and without an error
            // create a specific error for this case
            // Should never happen
            let sessionTokenError = NSError(
                domain: "com.footprint.bankLinking",
                code: 1001,
                userInfo: [NSLocalizedDescriptionKey: "Missing session token for bank linking"]
            )
            handleError(sessionTokenError)
            return AnyView(loadingView())
        }
        do {
            let configuration = try MKConfiguration(
                sessionToken: sessionToken,
                onSuccess: onSuccess(successType:),
                onExit: onExit(error:),
                onEvent: onEvent(event:) // TODO: in the future we should add logging to DD for this SDK and log these events
            )
            
            let linkHandler = MKLinkHandler(configuration: configuration)
            connectViewModel.linkHandler = linkHandler
            
            return AnyView(MKConnectView(viewModel: connectViewModel))
        } catch let error {
            handleError(error)
            
            return AnyView(loadingView())
        }
    }
    
    private func onSuccess(successType: MKLinkSuccessType) {
        switch successType {
        case let .linked(institution):
            Task{
                do {
                    try await Footprint.shared.postUserBankLinkingLinkSessionExchangeData(exchangeableToken: institution.token.value)
                    self.onSuccess?(
                        getBankLinkingCompletionMetaFromLinked(institution: institution)
                    )
                }catch {
                    handleError(error)
                }
            }
        case let .relinked(institution):
            self.onSuccess?(
                getBankLinkingCompletionMetaFromRelinked(institution: institution)
            )
        @unknown default:
            // TODO: what to do when this happens?
            self.onSuccess?(
                BankLinkingCompletionMeta(
                    accounts: [],
                    institution: FootprintBankLinkingInstitution(id: "", name: "", domain: nil),
                    trackedScreens: []
                )
            )
        }
    }
    
    private func onExit(error: MKLinkError?) {
        connectViewModel.linkHandler = nil
        if let error = error {
            handleMkError(error)
        } else {
            self.onClose?()
        }
    }
    
    private func onEvent(event: MKLinkEvent) {
        let footprintBalEvent = FootprintBankLinkingEvent(
            name: event.name,
            properties: event.properties,
            meta: event.meta
        )
        // TODO: in the future we should add logging to DD for this SDK and log these events
        self.onEvent?(footprintBalEvent)
    }
    
    private func handleMkError(_ error: MKLinkError)  {
        Task{
            let fpError = FootprintException(
                kind: FootprintException.ErrorKind.bankLinkingError,
                message: "Error: mkErrorId: \(error.errorId), mkRequestId \(String(describing: error.requestId)). Error: \(error.displayedMessage)",
                supportId: nil,
                sessionId: Footprint.shared.getSesstionId(),
                context: nil,
                code: nil
            )
            self.onError?(fpError)
            await Footprint.shared.logError(error: fpError)
        }
    }
    
    private func handleError(_ error: Error) {
        Task{
            let fpError = FootprintException(
                kind: FootprintException.ErrorKind.bankLinkingError,
                message: "Error: \(error.localizedDescription)",
                supportId: nil,
                sessionId: Footprint.shared.getSesstionId(),
                context: nil,
                code: nil
            )
            self.onError?(fpError)
            await Footprint.shared.logError(error: fpError)
        }
    }
    
    private func handleIncomingURL(_ url: URL) {
        self.connectViewModel.linkHandler?.continueFlow(from: url)
    }
}

extension Notification.Name {
    static let footprintBankLinkingRedirectReceived = Notification.Name("footprintBankLinkingRedirectReceived")
}
