import SwiftUI
import FootprintSwift

struct EmailAndPhoneView: View {  
    @State private var shouldNavigateToNextView = false
    
    var body: some View {
        FpForm(
            onSubmit: {
                Task {
                    print("onSubmit: ")
                    // Uncomment the following code when ready to implement the actual submission
                    // do {
                    //     try await FootprintProvider.shared.createEmailPhoneBasedChallenge(email: email, phoneNumber: phoneNumber)
                    //     shouldNavigateToNextView = true
                    // } catch {
                    //     print("Error: \(error)")
                    //     shouldNavigateToNextView = false
                    // }
                }
            },
            content: {
                VStack(spacing: 20) {
                    FpField(
                        name: .idPeriodEmail,
                        label: { FpLabel("Email", font: .subheadline, color: .secondary) },
                        input: { 
                            FpInput(placeholder: "Enter your email", keyboardType: .emailAddress, contentType: .emailAddress)
                                .padding()
                                .background(Color.gray.opacity(0.8))
                                .cornerRadius(50)
                        },
                        error: { FpFieldError() }
                    )
                    
                    FpField(
                        name: .idPeriodPhoneNumber,
                        label: { FpLabel("Phone Number", font: .subheadline, color: .secondary) },
                        input: { 
                            FpInput(placeholder: "Enter your phone number", keyboardType: .phonePad, contentType: .telephoneNumber)
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
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
        )
        .navigationTitle("Signup flow")
        .onAppear {
            Task {
                do {
                    let sandboxOutcome = SandboxOutcome(overallOutcome: .pass, documentOutcome: .pass)
                    try await FootprintProvider.shared.initialize(
                        configKey: "pb_test_QeSAeS8XHohiSpCOj2l4vd",
                        sandboxOutcome: sandboxOutcome
                    )
                } catch {
                    print("Error: \(error)")
                }
            }
        }
        .navigate(to: NextView(), when: $shouldNavigateToNextView)
    }
}

struct NextView: View {
    var body: some View {
        Text("Next View")
    }
}

extension View {
    func navigate<NewView: View>(to view: NewView, when binding: Binding<Bool>) -> some View {
        NavigationView {
            ZStack {
                self
                    .navigationBarTitle("")
                    .navigationBarHidden(true)

                NavigationLink(
                    destination: view
                        .navigationBarTitle("")
                        .navigationBarHidden(true),
                    isActive: binding
                ) {
                    EmptyView()
                }
            }
        }
        .navigationViewStyle(.stack)
    }
}
