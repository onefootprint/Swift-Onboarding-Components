//
//  ContentView.swift
//  DemoSwift
//
//  Created by Rafael Michels Motta on 07/11/23.
//
import FootprintPackage

import SwiftUI

struct ContentView: View {
    var footprint = FootprintPackage()
    
    var body: some View {
        VStack {
            Button("Verify") {
                footprint.showAlert(from: UIApplication.shared.windows.first!.rootViewController!.view)
            }
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
