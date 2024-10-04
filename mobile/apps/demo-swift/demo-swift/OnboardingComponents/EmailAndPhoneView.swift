import SwiftUI
import FootprintSwift
import Inject
import CustomDump


struct EmailAndPhoneView: View {
    @ObserveInjection var inject
    @State private var email: String = ""
    @State private var phoneNumber: String = ""
    private var onboardingComponents = FootprintProvider.shared
    @State private var shouldNavigateToNextView = false
    
    var body: some View {
        NavigationView {
            VStack {
                EmailInputField(email: $email, placeholder: "Enter your email", label: "Email")
                    .padding()
                PhoneInputField(phoneNumber: $phoneNumber, placeholder: "Enter your phone number", label: "Phone")
                    .padding()
                Button(action: {
                    Task {
                        do {
                            let response = try await onboardingComponents.identify(email: email, phoneNumber: phoneNumber)
                            customDump(response)

                            shouldNavigateToNextView = true
                        } catch {
                            customDump(error)
                            shouldNavigateToNextView = false
                        }
                    }
                }) {
                    Text("Continue")
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.blue)
                        .cornerRadius(8)
                }
                .padding()
                NavigationLink(destination: SignUpChallengeView(), isActive: $shouldNavigateToNextView) { EmptyView() }
            }
        }
        .onAppear(perform: {
            Task {
                do {
                    try await onboardingComponents.initialize(configKey:"pb_test_pZoERpZeZkGW7RRVeBawSm")
                } catch {
                    customDump(error)
                }                
            }
        })
        .enableInjection()
    }
}
