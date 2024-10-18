import SwiftUI

public struct FpInput: View {
    let placeholder: String
    let keyboardType: UIKeyboardType
    let isSecure: Bool
    let contentType: UITextContentType?
    @EnvironmentObject var form: FormManager
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
                        return form.idEmail
                    case .idPeriodPhoneNumber:
                        return form.idPhoneNumber
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
                        form.setValue(newValue, forKey: "idEmail")
                    case .idPeriodPhoneNumber:
                        form.setValue(newValue, forKey: "idPhoneNumber")
                    default:
                        break
                    }
                }
            }
        )
        
        return TextField(placeholder, text: binding)
            .keyboardType(keyboardType)
            .textContentType(contentType)
            .onAppear {
                print("FpInput: fpFieldName =", fpFieldName ?? "nil")
            }
    }
}
