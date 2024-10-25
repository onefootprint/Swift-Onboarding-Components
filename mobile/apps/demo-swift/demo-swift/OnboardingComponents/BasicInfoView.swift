import SwiftUI
import FootprintSwift

struct BasicInfoView: View {
    @State private var firstName: String = ""
    @State private var middleName: String = ""
    @State private var lastName: String = ""
    @State private var dateOfBirth: Date = Date()
    @State private var addressLine1: String = ""
    @State private var addressLine2: String = ""
    @State private var city: String = ""
    @State private var state: String = ""
    @State private var zipCode: String = ""
    @State private var country: String = ""
    @State private var ssn: String = ""
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?
    @State private var showSuccessView: Bool = false
    @State private var vaultData: VaultData?
    
    var body: some View {
        NavigationView {
            ScrollView {
                FpForm(
                    onSubmit: { vaultData in
                        isLoading = true
                        errorMessage = nil
                        Task {
                            do {
                                try await FootprintProvider.shared.vault(vaultData: vaultData)
                                print("Vault data submitted successfully")
                                let response = try await FootprintProvider.shared.process()
                                showSuccessView = true
                                print("Process submitted successfully : \(showSuccessView)")
                                
                            } catch {
                                if let footprintError = error as? FootprintError {
                                    switch footprintError.kind {
                                    case .inlineProcessNotSupported:
                                        do {
                                            try await FootprintProvider.shared.handoff(
                                                onCancel: {
                                                    print("Handoff was canceled by the user")
                                                    errorMessage = "Verification was canceled. Please try again."
                                                },
                                                onComplete: { validationToken in
                                                    print("Handoff completed successfully with token: \(validationToken)")
                                                    // You can add additional logic here if needed
                                                    showSuccessView = true
                                                },
                                                onError: { error in
                                                    print("Error occurred during handoff: \(error)")
                                                    errorMessage = "An error occurred during verification. Please try again."
                                                }
                                            )
                                        }
                                    case .vaultingError(let context):
                                        print("Vaulting error - context: \(context), message: \(footprintError.message)")
                                    default:
                                        print("Error occurred: \(error)")
                                    }
                                    
                                }
                            }
                            isLoading = false
                        }
                    },
                    content: {
                        VStack(spacing: 20) {
                            FpField(
                                name: .idPeriodFirstName,
                                label: { FpLabel("First name", font: .subheadline, color: .secondary) },
                                input: {
                                    FpInput(placeholder: "Enter your first name")
                                        .padding()
                                        .background(Color.gray.opacity(0.1))
                                        .cornerRadius(10)
                                },
                                error: { FpFieldError() }
                            )

                            FpField(
                                name: .idPeriodMiddleName,
                                label: { FpLabel("Middle name", font: .subheadline, color: .secondary) },
                                input: {
                                    FpInput(placeholder: "Enter your middle name")
                                        .padding()
                                        .background(Color.gray.opacity(0.1))
                                        .cornerRadius(10)
                                },
                                error: { FpFieldError() }
                            )
                            
                            FpField(
                                name: .idPeriodLastName,
                                label: { FpLabel("Last name", font: .subheadline, color: .secondary) },
                                input: {
                                    FpInput(placeholder: "Enter your last name")
                                        .padding()
                                        .background(Color.gray.opacity(0.1))
                                        .cornerRadius(10)
                                },
                                error: { FpFieldError() }
                            )

                            FpField(
                                name: .idPeriodDob,
                                label: { FpLabel("Date of birth", font: .subheadline, color: .secondary) },
                                input: {
                                    FpInput(placeholder: "Enter your date of birth")
                                        .padding()
                                        .background(Color.gray.opacity(0.1))
                                        .cornerRadius(10)
                                },
                                error: { FpFieldError() }
                            )

                            FpField(
                                name: .idPeriodAddressLine1,
                                label: { FpLabel("Address line 1", font: .subheadline, color: .secondary) },
                                input: {
                                    FpInput(placeholder: "Enter your address line 1")
                                        .padding()
                                        .background(Color.gray.opacity(0.1))
                                        .cornerRadius(10)
                                },
                                error: { FpFieldError() }
                            )

                            FpField(
                                name: .idPeriodAddressLine2,
                                label: { FpLabel("Address line 2", font: .subheadline, color: .secondary) },
                                input: {
                                    FpInput(placeholder: "Enter your address line 2")
                                        .padding()
                                        .background(Color.gray.opacity(0.1))
                                        .cornerRadius(10)
                                },
                                error: { FpFieldError() }
                            )

                            FpField(
                                name: .idPeriodCity,
                                label: { FpLabel("City", font: .subheadline, color: .secondary) },
                                input: {
                                    FpInput(placeholder: "Enter your city")
                                        .padding()
                                        .background(Color.gray.opacity(0.1))
                                        .cornerRadius(10)
                                },
                                error: { FpFieldError() }
                            )

                            FpField(
                                name: .idPeriodState,
                                label: { FpLabel("State", font: .subheadline, color: .secondary) },
                                input: {
                                    FpInput(placeholder: "Enter your state")
                                        .padding()
                                        .background(Color.gray.opacity(0.1))
                                        .cornerRadius(10)
                                },
                                error: { FpFieldError() }
                            )

                            FpField(
                                name: .idPeriodZip,
                                label: { FpLabel("Zip code", font: .subheadline, color: .secondary) },
                                input: {
                                    FpInput(placeholder: "Enter your zip code")
                                        .padding()
                                        .background(Color.gray.opacity(0.1))
                                        .cornerRadius(10)
                                },
                                error: { FpFieldError() }
                            )

                            FpField(
                                name: .idPeriodCountry,
                                label: { FpLabel("Country", font: .subheadline, color: .secondary) },
                                input: {
                                    FpInput(placeholder: "Enter your country")
                                        .padding()
                                        .background(Color.gray.opacity(0.1))
                                        .cornerRadius(10)
                                },
                                error: { FpFieldError() }
                            )

                            FpField(
                                name: .idPeriodSsn9,
                                label: { FpLabel("SSN", font: .subheadline, color: .secondary) },
                                input: {
                                    FpInput(placeholder: "Enter your SSN")
                                        .padding()
                                        .background(Color.gray.opacity(0.1))
                                        .cornerRadius(10)
                                },
                                error: { FpFieldError() }
                            )
                        }
                    },
                    submitButton: {
                        Text("Continue")
                            .foregroundColor(.white)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(isLoading ? Color.gray : Color.blue)
                            .cornerRadius(10)
                            .disabled(isLoading)
                    }
                )
            }
            .navigationBarHidden(true)
            .background(
                NavigationLink(destination: SuccessView(), isActive: $showSuccessView) {
                    EmptyView()
                }
            )
            .onAppear {
                Task {
                    do {
                        let fetchedVaultData = try await FootprintProvider.shared.getVaultData()
                        DispatchQueue.main.async {
                            self.vaultData = fetchedVaultData
                            self.updateFieldsWithVaultData()
                        }
                    } catch {
                        print("Error fetching vault data: \(error)")
                        errorMessage = "Failed to fetch your information. Please try again."
                    }
                }
            }
        }
    }
    
    private func updateFieldsWithVaultData() {
        guard let vaultData = vaultData else { return }
        
        firstName = vaultData.idFirstName ?? "John"
        middleName = vaultData.idMiddleName ?? "Doe"
        lastName = vaultData.idLastName ?? "Smith"
        if let dobString = vaultData.idDob,
           let dob = ISO8601DateFormatter().date(from: dobString) {
            dateOfBirth = dob
        } else {
            dateOfBirth = Calendar.current.date(from: DateComponents(year: 1990, month: 1, day: 1)) ?? Date()
        }
        addressLine1 = vaultData.idAddressLine1 ?? "123 Main St"
        addressLine2 = vaultData.idAddressLine2 ?? "Apt 4B"
        city = vaultData.idCity ?? "New York"
        state = vaultData.idState ?? "NY"
        zipCode = vaultData.idZip ?? "10001"
        country = vaultData.idCountry ?? "US"
        ssn = vaultData.idSsn9 ?? "123-45-6789"
    }
}

struct BasicInfoView_Previews: PreviewProvider {
    static var previews: some View {
        BasicInfoView()
    }
}
