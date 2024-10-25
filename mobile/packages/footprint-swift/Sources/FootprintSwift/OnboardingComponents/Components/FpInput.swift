import SwiftUI

public struct FpInput: View {
    let placeholder: String
    let isSecure: Bool
    @EnvironmentObject var form: FormManager
    @Environment(\.fpFieldName) var fpFieldName: VaultDI?
    
    public init(
        placeholder: String,
        isSecure: Bool = false
    ) {
        self.placeholder = placeholder
        self.isSecure = isSecure
    }
    
    public var body: some View {
        var fpInputProps: FootprintInputProps = .init()
        if let fieldName = fpFieldName{
            fpInputProps = getInputProps(fieldName: fieldName)
            form.addToFieldsUsed(fieldName)
        }
        let binding = Binding<String>(
            get: {
                guard let fieldName = fpFieldName else { return "" }
                let value = form.getValueByVaultDi(fieldName) ?? ""
                return value
            },
            set: { newValue in
                guard let fieldName = fpFieldName else { return }
                form.setValueByVaultDI(newValue, forDi: fieldName)
            }
        )
        
        return TextField(placeholder, text: binding)
            .keyboardType(fpInputProps.keyboardType ?? .default)
            .textContentType(fpInputProps.textContentType)
            .onChange(of: binding.wrappedValue){newValue in
                guard let fieldName = fpFieldName else { return }
                var refinedValue = newValue
                if let format = fpInputProps.format {
                    if !refinedValue.isEmpty {
                        refinedValue = format(refinedValue)
                    }
                }
                if let maxLengthLimit = fpInputProps.maxLength {
                    refinedValue = String(refinedValue.prefix(maxLengthLimit))
                    print(refinedValue)
                }
                binding.wrappedValue = refinedValue
            }
            .onAppear {
                print("FpInput: fpFieldName =", fpFieldName ?? "nil")
            }
    }
}
