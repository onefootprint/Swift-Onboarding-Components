import SwiftUI
import Footprint

struct ContentView: View {
    var body: some View {
        NavigationStack {
        VStack  {
           
        }
        .padding(50)
            NavigationLink("Onboarding components - signup", destination: EmailAndPhoneView()).padding(50)
            NavigationLink("Onboarding components - authToken", destination: AuthTokenView()).padding(50)
            
        } 
    }
    
}
