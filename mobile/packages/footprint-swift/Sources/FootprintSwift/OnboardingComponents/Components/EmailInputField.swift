import SwiftUI

public struct EmailInputField: View {
    @Binding var email: String
    var placeholder: String = "Enter your email"
    var label: String
    
    @State private var isEmailValid: Bool = true
    @State private var showErrorMessage: Bool = false
    
    public init(email: Binding<String>, placeholder: String = "Enter your email", label: String = "Email") {
        self._email = email
        self.placeholder = placeholder
        self.label = label
    }
       
    public var body: some View {
        VStack(alignment: .leading) {
            Text(label)
                .font(.headline)
                .padding(.bottom, 4)
            TextField(placeholder, text: $email)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
                .disableAutocorrection(true)
                .textContentType(.emailAddress)
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)              
        }
    }
}
