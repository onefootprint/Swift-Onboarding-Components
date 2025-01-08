import SwiftUI

public struct FpFieldError: View {
    let textColor: Color
    let font: Font
    var message: String?
    @EnvironmentObject var form: FormManager
    @EnvironmentObject var fieldManager: FieldManager
    private var errorMessage: String? {
        if let fpFieldName = fieldManager.name {
            let err = form.getErrorByFieldName(fieldName: fpFieldName)
            if let err {
                return message ?? err
            } else {
                return nil
            }
        }else{
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
