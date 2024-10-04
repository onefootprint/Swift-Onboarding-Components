import SwiftUI
import FootprintSwift

struct BasicInfoView: View {
    @State private var firstName: String = "John"
    @State private var middleName: String = "Doe"
    @State private var lastName: String = "Smith"
    @State private var dateOfBirth: Date = Calendar.current.date(from: DateComponents(year: 1990, month: 1, day: 1)) ?? Date()
    @State private var addressLine1: String = "123 Main St"
    @State private var addressLine2: String = "Apt 4B"
    @State private var city: String = "New York"
    @State private var state: String = "NY"
    @State private var zipCode: String = "10001"
    @State private var country: String = "US"
    @State private var ssn: String = "123-45-6789"
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Text("Basic Information")
                    .font(.title)
                    .fontWeight(.bold)
                
                GenericInputField(
                    text: $firstName,
                    placeholder: "First Name"
                )
                
                GenericInputField(
                    text: $middleName,
                    placeholder: "Middle Name"
                )
                
                GenericInputField(
                    text: $lastName,
                    placeholder: "Last Name"
                )
                
                DatePicker("Date of Birth", selection: $dateOfBirth, displayedComponents: .date)
                    .datePickerStyle(DefaultDatePickerStyle())
                
                GenericInputField(
                    text: $addressLine1,
                    placeholder: "Address Line 1"
                )
                
                GenericInputField(
                    text: $addressLine2,
                    placeholder: "Address Line 2 (Optional)"
                )
                
                GenericInputField(
                    text: $city,
                    placeholder: "City"
                )
                
                GenericInputField(
                    text: $state,
                    placeholder: "State"
                )
                
                GenericInputField(
                    text: $zipCode,
                    placeholder: "Zip Code",
                    keyboardType: .numberPad
                )
                
                GenericInputField(
                    text: $country,
                    placeholder: "Country"
                )
                
                GenericInputField(
                    text: $ssn,
                    placeholder: "SSN",
                    keyboardType: .numberPad                    
                )
                
                Button(action: {
                    isLoading = true
                    errorMessage = nil
                    Task {
                        do {
                            let dateFormatter = DateFormatter()
                            dateFormatter.dateFormat = "yyyy-MM-dd"
                            let dobString = dateFormatter.string(from: dateOfBirth)
                            
                            let vaultData = VaultData(
                                idAddressLine1: addressLine1,
                                idAddressLine2: addressLine2,
                                idCity: city,
                                idCountry: country,
                                idDob: dobString,
                                idFirstName: firstName,
                                idLastName: lastName,
                                idMiddleName: middleName,
                                idSsn9: ssn,
                                idState: state,
                                idZip: zipCode
                            )
                            
                            try await FootprintProvider.shared.vault(vaultData: vaultData)
                            print("Vault data submitted successfully")
                            
                            try await FootprintProvider.shared.process()
                           
                        } catch {
                            errorMessage = "Failed to submit data. Please try again."
                            print("Error submitting vault data: \(error)")
                        }
                        isLoading = false
                    }
                }) {
                    if isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Continue")
                    }
                }
                .foregroundColor(.white)
                .padding()
                .frame(maxWidth: .infinity)
                .background(isLoading ? Color.gray : Color.blue)
                .cornerRadius(10)
                .disabled(isLoading)
                
                if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .padding()
                }
                
                Spacer()
            }
            .padding()
        }
    }
}

struct BasicInfoView_Previews: PreviewProvider {
    static var previews: some View {
        BasicInfoView()
    }
}
