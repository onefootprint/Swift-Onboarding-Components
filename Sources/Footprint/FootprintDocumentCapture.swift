import Foundation
@_exported import SwiftOnboardingComponentsShared

// SKIE bridges the Kotlin FootprintException as a plain class that isn't a Swift Error,
// so it can't be thrown as-is. Conform it retroactively so captureDocument can throw it and
// integrators catch it like any other Footprint error.
extension FootprintException: @retroactive Error {}

/// Options for `Footprint.captureDocument`, mirroring footprint-expo's `DocumentOptions`.
public struct FootprintDocumentCaptureOptions: Sendable {
    public let kind: DocumentKind
    public let countryCode: Iso3166TwoDigitCountryCode
    public let autoCapture: Bool
    public let allowGalleryUpload: Bool

    public init(
        kind: DocumentKind,
        countryCode: Iso3166TwoDigitCountryCode,
        autoCapture: Bool = true,
        allowGalleryUpload: Bool = true
    ) {
        self.kind = kind
        self.countryCode = countryCode
        self.autoCapture = autoCapture
        self.allowGalleryUpload = allowGalleryUpload
    }
}

public struct FootprintCaptureDocumentResult: Sendable {
    public let uploadedSides: [DocumentSide]
    public let canceled: Bool
    /// The backend rejected the last allowed capture and failed the document, so the onboarding moves on without it.
    public let isRetryLimitExceeded: Bool

    public init(uploadedSides: [DocumentSide], canceled: Bool = false, isRetryLimitExceeded: Bool = false) {
        self.uploadedSides = uploadedSides
        self.canceled = canceled
        self.isRetryLimitExceeded = isRetryLimitExceeded
    }
}

/// Everything the camera package needs to present the capture UI and drive the
/// per-side loop. The SDK creates the document and owns `uploadSide` (the network
/// round-trip); the provider owns the capture UI.
public struct FootprintDocumentCaptureContext: Sendable {
    public let documentId: String
    public let documentKind: DocumentKind
    public let countryCode: Iso3166TwoDigitCountryCode?
    public let shouldCollectSelfie: Bool
    public let autoCapture: Bool
    public let allowGalleryUpload: Bool
    public let language: String?
    public let uploadSide: @Sendable (
        _ imageBase64: String,
        _ side: DocumentSide,
        _ isManual: Bool,
        _ fromGallery: Bool
    ) async throws -> FootprintDocumentProcessResult

    public init(
        documentId: String,
        documentKind: DocumentKind,
        countryCode: Iso3166TwoDigitCountryCode?,
        shouldCollectSelfie: Bool,
        autoCapture: Bool,
        allowGalleryUpload: Bool,
        language: String?,
        uploadSide: @escaping @Sendable (String, DocumentSide, Bool, Bool) async throws -> FootprintDocumentProcessResult
    ) {
        self.documentId = documentId
        self.documentKind = documentKind
        self.countryCode = countryCode
        self.shouldCollectSelfie = shouldCollectSelfie
        self.autoCapture = autoCapture
        self.allowGalleryUpload = allowGalleryUpload
        self.language = language
        self.uploadSide = uploadSide
    }
}

/// Implemented by the opt-in `FootprintDocumentCapture` product and registered via
/// `Footprint.shared.setDocumentCaptureProvider`. Without a registered provider,
/// `Footprint.captureDocument` throws `E_NO_CAMERA_MODULE`.
public protocol FootprintDocumentCaptureProvider: Sendable {
    func present(_ context: FootprintDocumentCaptureContext) async throws -> FootprintCaptureDocumentResult
}

internal actor DocumentCaptureProviderStore {
    private var provider: FootprintDocumentCaptureProvider?
    func set(_ provider: FootprintDocumentCaptureProvider) { self.provider = provider }
    func get() -> FootprintDocumentCaptureProvider? { provider }
}

private let documentCaptureProviderStore = DocumentCaptureProviderStore()

extension Footprint {
    /// Registered by the opt-in `FootprintDocumentCapture` product to enable `captureDocument`.
    public func setDocumentCaptureProvider(_ provider: FootprintDocumentCaptureProvider) {
        Task { await documentCaptureProviderStore.set(provider) }
    }

    public func hasDocumentCapture() async -> Bool {
        await documentCaptureProviderStore.get() != nil
    }

    /// The pending `collect_document` requirement, or nil if none is pending.
    public func getDocumentConfig() async throws -> FootprintDocumentConfig? {
        try await SwiftOnboardingComponentsShared._Footprint.shared.getDocumentConfig()
    }

    public func submitConsent(consentLanguageText: String, mlConsent: Bool = false) async throws {
        try await SwiftOnboardingComponentsShared._Footprint.shared.submitConsent(
            consentLanguageText: consentLanguageText,
            mlConsent: mlConsent
        )
    }

    /// Collect an ID document inline. Requires the `FootprintDocumentCapture` product
    /// (registered via `setDocumentCaptureProvider`); otherwise throws `E_NO_CAMERA_MODULE`.
    public func captureDocument(
        options: FootprintDocumentCaptureOptions
    ) async throws -> FootprintCaptureDocumentResult {
        try await capture { config in
            if config.isSelfie {
                throw FootprintException(
                    kind: .onboardingError,
                    message: "The pending document requirement is a selfie. Call captureSelfie instead.",
                    supportId: nil,
                    sessionId: nil,
                    context: nil,
                    code: nil
                )
            }
            return CaptureTarget(
                kind: options.kind,
                countryCode: options.countryCode,
                autoCapture: options.autoCapture,
                allowGalleryUpload: options.allowGalleryUpload
            )
        }
    }

    /// Captures the standalone selfie a Selfie node asks for, in manual mode when its face detection is off.
    public func captureSelfie() async throws -> FootprintCaptureDocumentResult {
        try await capture { config in
            if !config.isSelfie {
                throw FootprintException(
                    kind: .onboardingError,
                    message: "No selfie requirement is currently pending. Call captureDocument instead.",
                    supportId: nil,
                    sessionId: nil,
                    context: nil,
                    code: nil
                )
            }
            return CaptureTarget(
                kind: .selfie,
                countryCode: nil,
                autoCapture: config.requireFaceDetection != .off,
                allowGalleryUpload: false
            )
        }
    }

    private func capture(
        toTarget: (FootprintDocumentConfig) throws -> CaptureTarget
    ) async throws -> FootprintCaptureDocumentResult {
        guard let provider = await documentCaptureProviderStore.get() else {
            throw FootprintException(
                kind: .sdkError,
                message: "Document capture requires the FootprintDocumentCapture product. Add it and call "
                    + "Footprint.shared.setDocumentCaptureProvider(...), or use the hosted flow.",
                supportId: nil,
                sessionId: nil,
                context: nil,
                code: "E_NO_CAMERA_MODULE"
            )
        }
        guard let config = try await getDocumentConfig() else {
            throw FootprintException(
                kind: .onboardingError,
                message: "No collect_document requirement is currently pending.",
                supportId: nil,
                sessionId: nil,
                context: nil,
                code: nil
            )
        }
        let target = try toTarget(config)
        let documentId = try await SwiftOnboardingComponentsShared._Footprint.shared.createDocument(
            documentRequestId: config.documentRequestId,
            documentType: target.kind,
            countryCode: target.countryCode,
            shouldCollectSelfie: config.shouldCollectSelfie
        )
        let language = SwiftOnboardingComponentsShared._Footprint.shared.getL10n().language?.value
        let retryLimit = RetryLimitFlag()
        let context = FootprintDocumentCaptureContext(
            documentId: documentId,
            documentKind: target.kind,
            countryCode: target.countryCode,
            shouldCollectSelfie: config.shouldCollectSelfie,
            autoCapture: target.autoCapture,
            allowGalleryUpload: target.allowGalleryUpload,
            language: language,
            uploadSide: { imageBase64, side, isManual, fromGallery in
                let result = try await SwiftOnboardingComponentsShared._Footprint.shared.uploadDocumentSide(
                    documentId: documentId,
                    side: side,
                    imageBase64: imageBase64,
                    isManual: isManual,
                    fromGallery: fromGallery
                )
                await retryLimit.record(result.isRetryLimitExceeded)
                return result
            }
        )
        let result = try await provider.present(context)
        return FootprintCaptureDocumentResult(
            uploadedSides: result.uploadedSides,
            canceled: result.canceled,
            isRetryLimitExceeded: await retryLimit.isExceeded
        )
    }
}

private struct CaptureTarget {
    let kind: DocumentKind
    let countryCode: Iso3166TwoDigitCountryCode?
    let autoCapture: Bool
    let allowGalleryUpload: Bool
}

private actor RetryLimitFlag {
    private(set) var isExceeded = false
    func record(_ exceeded: Bool) { isExceeded = exceeded }
}
