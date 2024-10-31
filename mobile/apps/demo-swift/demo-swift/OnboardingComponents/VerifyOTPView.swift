import SwiftUI
import FootprintSwift
import Inject


struct VerifyOTPView: View {
    @ObserveInjection var inject
    private var onboardingComponents = FootprintProvider.shared
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?
    @State private var navigateToBasicInfo: Bool = false
    
    var body: some View {
        NavigationView {
            VStack {
                Text("Enter Verification Code")
                    .font(.title2)
                    .padding(.bottom, 20)
                
                PinInputField(){pincode in
                    submitPin(pin: pincode)}
                    .padding()
                
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                }
                
                if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .padding()
                }
            }           
            .enableInjection()
            .background(
                NavigationLink(destination: BasicInfoView(), isActive: $navigateToBasicInfo) {
                    EmptyView()
                }
            )
        }
    }
    
    private func submitPin(pin: String) {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
               let response =  try await FootprintProvider.shared.verify(verificationCode: pin)
                            
                DispatchQueue.main.async {
                    self.navigateToBasicInfo = true
                }
            } catch {
                errorMessage = "Failed to submit PIN. Please try again."
                print("Error submitting PIN: \(error)")
            }
            
            isLoading = false
        }
    }
}
