import SwiftUI
import FootprintSwift

struct BasicInfoView: View {
    @State private var firstName: String = ""
    @State private var lastName: String = ""
    @State private var isButtonEnabled: Bool = false
    
    var body: some View {
        VStack(spacing: 24) {
            Text("Basic Information")
                .font(.title)
                .fontWeight(.bold)
            
            GenericInputField(
                text: $firstName,
                placeholder: "First Name"
            )
            
            GenericInputField(
                text: $lastName,
                placeholder: "Last Name"
            )
            
            Button(action: {
                // Handle continue action
                print("Continue button tapped")
            }) {
                Text("Continue")
                    .foregroundColor(.white)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(isButtonEnabled ? Color.blue : Color.gray)
                    .cornerRadius(10)
            }
            .disabled(!isButtonEnabled)
            
            Spacer()
        }
        .padding()
        .onChange(of: firstName) { _ in updateButtonState() }
        .onChange(of: lastName) { _ in updateButtonState() }
    }
    
    private func updateButtonState() {
        isButtonEnabled = !firstName.isEmpty && !lastName.isEmpty
    }
}

struct BasicInfoView_Previews: PreviewProvider {
    static var previews: some View {
        BasicInfoView()
    }
}
