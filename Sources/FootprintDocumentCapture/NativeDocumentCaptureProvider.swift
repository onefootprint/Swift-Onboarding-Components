import UIKit
import SwiftUI
import Footprint
import SwiftOnboardingComponentsShared
// The Swift camera screen + the Kotlin types (CameraCaptureView / CaptureAppearance /
// DocumentProcessResult / CaptureImageError / IosDocumentCaptureCoordinator).
import FootprintNativeCameraSwift
import FootprintNativeCamera

/// Tracks the capture session's uploaded sides and guards single-resume of the
/// async continuation across the several terminal callbacks.
private final class CaptureState: @unchecked Sendable {
    private let lock = NSLock()
    private var resumed = false
    private var uploaded: [DocumentSide] = []

    func tryResume() -> Bool {
        lock.lock(); defer { lock.unlock() }
        if resumed { return false }
        resumed = true
        return true
    }

    func record(_ side: DocumentSide) {
        lock.lock(); defer { lock.unlock() }
        if !uploaded.contains(side) { uploaded.append(side) }
    }

    func sides() -> [DocumentSide] {
        lock.lock(); defer { lock.unlock() }
        return uploaded
    }
}

private struct UploadCallbacks: @unchecked Sendable {
    let onResult: (DocumentProcessResult) -> Void
    let onError: (String, String) -> Void
}

/// Presents the shared camera module's document-capture UI and routes each side's
/// upload back through the SDK (`FootprintDocumentCaptureContext.uploadSide`).
public final class NativeDocumentCaptureProvider: FootprintDocumentCaptureProvider {
    public init() {}

    public func present(
        _ context: FootprintDocumentCaptureContext
    ) async throws -> FootprintCaptureDocumentResult {
        try await withCheckedThrowingContinuation { continuation in
            let state = CaptureState()

            // Per side: run the SDK's upload/process, map the result into the camera
            // module's DocumentProcessResult. KMM bridges the nested lambda params as
            // `-> KotlinUnit`, so wrap them as plain Swift closures.
            IosDocumentCaptureCoordinator.shared.uploadSide = { imageBase64, side, isManual, fromGallery, onResult, onError in
                let mappedSide = Self.mapSide(side)
                let manual = isManual.boolValue
                let gallery = fromGallery.boolValue
                // The KMM callbacks aren't Sendable; box them so the Task can capture them. They're
                // safe to invoke off the calling thread — they resolve the module's upload continuation.
                let callbacks = UploadCallbacks(onResult: { onResult($0) }, onError: { onError($0, $1) })
                Task {
                    do {
                        let result = try await context.uploadSide(imageBase64, mappedSide, manual, gallery)
                        state.record(mappedSide)
                        callbacks.onResult(DocumentProcessResult(
                            errors: result.errors.map { CaptureImageError(code: $0, message: nil) },
                            isRetryLimitExceeded: result.isRetryLimitExceeded,
                            nextSideToCollect: result.nextSideToCollect?.value
                        ))
                    } catch {
                        let fp = error as? FootprintException
                        callbacks.onError(fp?.code ?? "UPLOAD_ERROR", fp?.message ?? error.localizedDescription)
                    }
                }
            }

            DispatchQueue.main.async {
                guard let presenter = Self.topMostViewController() else {
                    IosDocumentCaptureCoordinator.shared.uploadSide = nil
                    if state.tryResume() {
                        continuation.resume(throwing: FootprintException(
                            kind: .sdkError,
                            message: "Could not find a view controller to present the capture screen.",
                            supportId: nil, sessionId: nil, context: nil, code: "NO_PRESENTER"
                        ))
                    }
                    return
                }

                var host: UIHostingController<CameraCaptureView>!
                let finish: (@escaping () -> Void) -> Void = { body in
                    IosDocumentCaptureCoordinator.shared.uploadSide = nil
                    host.dismiss(animated: true, completion: body)
                }
                let view = CameraCaptureView(
                    startSide: "front",
                    documentKind: context.documentKind.value,
                    appearance: CaptureAppearance.companion.fromVariables(theme: nil, variables: [:], fontFamily: nil),
                    language: context.language,
                    onError: { code, message in
                        finish {
                            if state.tryResume() {
                                continuation.resume(throwing: FootprintException(
                                    kind: .onboardingError, message: message,
                                    supportId: nil, sessionId: nil, context: nil, code: code
                                ))
                            }
                        }
                    },
                    onComplete: {
                        finish {
                            if state.tryResume() {
                                continuation.resume(returning: FootprintCaptureDocumentResult(
                                    uploadedSides: state.sides(), canceled: false
                                ))
                            }
                        }
                    },
                    onClose: {
                        finish {
                            if state.tryResume() {
                                continuation.resume(returning: FootprintCaptureDocumentResult(
                                    uploadedSides: [], canceled: true
                                ))
                            }
                        }
                    }
                )
                host = UIHostingController(rootView: view)
                host.modalPresentationStyle = .fullScreen
                presenter.present(host, animated: true)
            }
        }
    }

    private static func mapSide(_ side: String) -> DocumentSide {
        switch side {
        case "front": return .front
        case "back": return .back
        case "selfie": return .selfie
        default: return .unknown
        }
    }

    /// Walks to the deepest presented controller so we don't present under an existing sheet.
    private static func topMostViewController() -> UIViewController? {
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        let keyWindow = scenes.flatMap { $0.windows }.first { $0.isKeyWindow } ?? scenes.first?.windows.first
        var top = keyWindow?.rootViewController
        while let next = top?.presentedViewController { top = next }
        return top
    }
}

/// One-line opt-in: registers native document capture with the Footprint SDK.
public func registerFootprintDocumentCapture() {
    Footprint.shared.setDocumentCaptureProvider(NativeDocumentCaptureProvider())
}
