import SwiftUI
import FootprintSwift
import Inject
import CustomDump


struct SignUpChallengeView: View {
    @ObserveInjection var inject
    private var onboardingComponents = FootprintProvider.shared
    
    var body: some View {
        NavigationView {
            VStack {
                Text("TODO")
            }
            .onAppear(perform: {
                
            })
            .enableInjection()
        }
    }
}
