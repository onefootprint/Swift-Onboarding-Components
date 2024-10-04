import SwiftUI

public struct GenericInputField: View {
    @Binding var text: String
    let placeholder: String
    let keyboardType: UIKeyboardType
    
    let isSecure: Bool
    
    public init(
        text: Binding<String>,
        placeholder: String,
        keyboardType: UIKeyboardType = .default,
        isSecure: Bool = false
    ) {
        self._text = text
        self.placeholder = placeholder
        self.keyboardType = keyboardType        
        self.isSecure = isSecure
    }
    
    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(placeholder)
                .font(.subheadline)
                .foregroundColor(.gray)
            
            Group {
                if isSecure {
                    SecureField("", text: $text)
                } else {
                    TextField("", text: $text)
                }
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(8)
            .keyboardType(keyboardType)
        }
    }
}

struct GenericInputField_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 20) {
            GenericInputField(text: .constant(""), placeholder: "Name")
            GenericInputField(text: .constant(""), placeholder: "Email", keyboardType: .emailAddress)
            GenericInputField(text: .constant(""), placeholder: "Password", isSecure: true)
        }
        .padding()
    }
}
