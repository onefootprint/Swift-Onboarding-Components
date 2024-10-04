import SwiftUI

public struct PhoneInputField: View {
    @Binding var phoneNumber: String
    var placeholder: String = "Enter your phone number"
    var label: String
    
    @State private var isPhoneValid: Bool = true
    @State private var showErrorMessage: Bool = false
    
    public init(phoneNumber: Binding<String>, placeholder: String = "Enter your phone number", label: String = "Phone") {
        self._phoneNumber = phoneNumber
        self.placeholder = placeholder
        self.label = label
    }    
    
    public var body: some View {
        VStack(alignment: .leading) {
            Text(label)
                .font(.headline)
                .padding(.bottom, 4)            
            TextField(placeholder, text: $phoneNumber)
                .keyboardType(.numberPad)
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)
        }
    }
}
