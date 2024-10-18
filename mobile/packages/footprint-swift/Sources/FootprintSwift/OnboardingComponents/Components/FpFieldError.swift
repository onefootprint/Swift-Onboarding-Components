import SwiftUI

public struct FpFieldError: View {
    let textColor: Color
    let font: Font
    var message: String?
    @EnvironmentObject var form: FormManager
    @Environment(\.fpFieldName) var fpFieldName: VaultDI?
    private var errorMessage: String? {
        switch fpFieldName {
        case .idPeriodEmail:
            if let err = form.errors["idEmail"] {
                return message ?? err
            } else {
                return nil
            }
            
        case .idPeriodPhoneNumber:
            if let err = form.errors["idPhoneNumber"] {
                return message ?? err
            } else {
                return nil
            }
        default:
            return nil
        }
    }
    
    public init(
        textColor: Color = .red,
        font: Font = .caption,
        message: String? = nil
    ) {
        self.textColor = textColor
        self.font = font
        self.message = message
    }
    
    public var body: some View {            
        VStack(alignment: .leading, spacing: 4) {
            if let errorMessage = errorMessage {
                ValidationMessageView(errorMessage: errorMessage)
            }
        }
    }
}

private struct ValidationMessageView: View {
    var errorMessage: String
    
    var body: some View {
        Text(errorMessage)
            .font(.caption)
            .foregroundColor(.red)
    }
}
