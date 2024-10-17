import SwiftUI

public struct FpInput: View {
    let placeholder: String
    let keyboardType: UIKeyboardType
    let isSecure: Bool
    let contentType: UITextContentType?
    @EnvironmentObject var form: FormValidator
    @Environment(\.fpFieldName) var fpFieldName: VaultDI?
    
    public init(
        placeholder: String,
        keyboardType: UIKeyboardType = .default,
        isSecure: Bool = false,
        contentType: UITextContentType? = nil
    ) {
        self.placeholder = placeholder
        self.keyboardType = keyboardType
        self.isSecure = isSecure
        self.contentType = contentType
    }
    
    public var body: some View {
        let binding = Binding<String>(
            get: {
                if let fieldName = fpFieldName {
                    switch fieldName {
                    case .idPeriodEmail:
                        return form.email
                    case .idPeriodPhoneNumber:
                        return form.phoneNumber
                    default:
                        return ""
                    }
                }
                return ""
            },
            set: { newValue in
                if let fieldName = fpFieldName {
                    print("Setting new value: \(newValue) in \(fieldName)")
                    
                    switch fieldName {
                    case .idPeriodEmail:
                        form.email = newValue
                    case .idPeriodPhoneNumber:
                        form.phoneNumber = newValue
                    default:
                        break
                    }
                }
            }
        )
        
        return TextField(placeholder, text: binding)
            .validation(fpFieldName == .idPeriodEmail ? form.emailValidation : form.phoneNumberValidation)
            .keyboardType(keyboardType)
            .textContentType(contentType)
            .onAppear {
                print("FpInput: fpFieldName =", fpFieldName ?? "nil")
            }
    }
}
