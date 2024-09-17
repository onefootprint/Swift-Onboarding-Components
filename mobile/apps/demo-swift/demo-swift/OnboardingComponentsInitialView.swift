import SwiftUI
import FootprintSwift
import Inject
import CustomDump


struct OnboardingComponentsInitialView: View {
    @ObserveInjection var inject
    
    var body: some View {
        NavigationView {
            VStack {
                Text("TODO: build the hot reload works")
            }
        }
        .onAppear(perform: {
            Task {
                let onboardingComponents = FootprintProvider.shared
                onboardingComponents.initialize(configKey: "pb_test_pZoERpZeZkGW7RRVeBawSm")
                let response =  await onboardingComponents.getOnboardingConfig()
                customDump(response)
            }
        })
        .enableInjection()
    }
}
