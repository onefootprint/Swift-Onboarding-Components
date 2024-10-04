import SwiftUI
import FootprintSwift
import Inject
import CustomDump


struct EmailAndPhoneView: View {
    @ObserveInjection var inject
    @State private var email: String = "sandbox@onefootprint.com"
    @State private var phoneNumber: String = "+15555550100"
    private var onboardingComponents = FootprintProvider.shared
    @State private var shouldNavigateToNextView = false
    @State private var isLoading = false
    
    var body: some View {
        NavigationView {
            VStack {
                EmailInputField(email: $email, placeholder: "Enter your email", label: "Email")
                    .padding()
                PhoneInputField(phoneNumber: $phoneNumber, placeholder: "Enter your phone number", label: "Phone")
                    .padding()
                Button(action: {
                    isLoading = true
                    Task {
                        do {
                            let response = try await onboardingComponents.identify(email: email, phoneNumber: phoneNumber)
                            customDump(response)

                            shouldNavigateToNextView = true
                        } catch {
                            customDump(error)
                            shouldNavigateToNextView = false
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
                .cornerRadius(8)
                .disabled(isLoading)
                .padding()
                NavigationLink(destination: SignUpChallengeView(), isActive: $shouldNavigateToNextView) { EmptyView() }
            }
        }
        .onAppear(perform: {
            Task {
                do {
                    try await onboardingComponents.initialize(configKey:"pb_test_2i5Sl82d7NQOnToRYrD2dx")
                } catch {
                    customDump(error)
                }                
            }
        })
        .enableInjection()
    }
}
