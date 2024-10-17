import SwiftUI
import FormValidator

public struct FpFieldError: View {
    let textColor: Color
    let font: Font
    let errorMessage: String?
    @EnvironmentObject var form: FormValidator
    @Environment(\.fpFieldName) var fpFieldName: VaultDI?
    @State private var hasError: Bool = false
    
    public init(
        textColor: Color = .red,
        font: Font = .caption,
        errorMessage: String? = nil
    ) {
        self.textColor = textColor
        self.font = font
        self.errorMessage = errorMessage
    }
    
    public var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if !hasError {
                EmptyView()
            } else if let errorMessage = errorMessage {
                Text(errorMessage)
                    .font(font)
                    .foregroundColor(textColor)
            } else if let fpFieldName = fpFieldName {
                switch fpFieldName {
                case .idPeriodEmail:
                    ValidationMessageView(validation: form.emailValidation)
                case .idPeriodPhoneNumber:
                    ValidationMessageView(validation: form.phoneNumberValidation)
                default:
                    EmptyView()
                }
            }
        }
        .onReceive(form.manager.$allValid) { isValid in
            print("Is valid: \(isValid)")
        }
        .onReceive(form.manager.$allFilled) { isFilled in
            print("Is all filled: \(isFilled)")
        }
        .onReceive(form.manager.$validationMessages) { messages in
            print("Form validation messages: \(messages)")
            hasError = !messages.isEmpty
        }
    }
        
}

private struct ValidationMessageView: View {
    var validation: ValidationContainer
    
    
    var body: some View {
        if    validation.validator.validate().isFailure {
            Text(validation.validator.message())
                .font(.caption)
                .foregroundColor(.red)
        }
    }
}
