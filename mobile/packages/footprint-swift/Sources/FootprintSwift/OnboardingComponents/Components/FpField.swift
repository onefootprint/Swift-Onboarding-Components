import SwiftUI

public struct FpField<Content: View>: View {
    let name: FpFieldName
    @StateObject var fieldManager: FieldManager = FieldManager()
    let content: Content
    
    public init(
        name: FpFieldName,
        @ViewBuilder content: () -> Content
    ) {
        self.name = name
        self.content = content()
    }
    
    public var body: some View {
        VStack {
            content
        }
        .environmentObject(fieldManager)
        .onAppear {
            fieldManager.setName(name)
        }
    }
}
