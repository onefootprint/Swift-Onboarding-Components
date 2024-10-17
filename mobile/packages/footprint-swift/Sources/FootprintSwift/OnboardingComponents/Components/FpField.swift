import SwiftUI

public struct FpField<InputView: View, LabelView: View, ErrorView: View>: View {  
    let name: VaultDI
    let label: LabelView
    let input: InputView
    let error: ErrorView?
    
    public init(
        name: VaultDI,
        @ViewBuilder label: () -> LabelView,
        @ViewBuilder input: () -> InputView,
        error: (() -> ErrorView)? = nil
    ) {
        self.name = name
        self.label = label()
        self.input = input()
        self.error = error?()
    }
    
    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            label.environment(\.fpFieldName, name)
            input.environment(\.fpFieldName, name)
            if let error = error {
                error.environment(\.fpFieldName, name)
            }
        }
    }
}

private struct FpFieldNameKey: EnvironmentKey {
    static let defaultValue: VaultDI? = nil
}

extension EnvironmentValues {
    var fpFieldName: VaultDI? {
        get { self[FpFieldNameKey.self] }
        set { self[FpFieldNameKey.self] = newValue }
    }
}
