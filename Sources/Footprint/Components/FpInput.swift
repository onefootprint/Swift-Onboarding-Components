import SwiftUI

public struct FpInput: View {
    var placeholder: String?
    @EnvironmentObject var form: FormManager
    @EnvironmentObject var fieldManager: FieldManager
    var asCustomTextField: ((_ binding: Binding<String>, _ handleChange: @escaping (String) -> Void) -> AnyView)?
    
    // Initializer for custom text field
    public init(
        asCustomTextField: @escaping (_ binding: Binding<String>, _ handleChange: @escaping (String) -> Void) -> AnyView
    ) {
        self.asCustomTextField = asCustomTextField
    }
    
    // Initializer for default TextField
    public init(placeholder: String? = nil) {
        self.placeholder = placeholder
        self.asCustomTextField = nil // No custom text field provided
    }
    
    public var body: some View {
        var fpInputProps: FootprintInputProps = .init()
        if let fieldName = fieldManager.name {
            fpInputProps = getInputProps(fieldName: fieldName)
            form.addToFieldsUsed(fieldName)
        }
        
        let binding = Binding<String>(
            get: {
                guard let fieldName = fieldManager.name else { return "" }
                return form.getValueByFieldName(fieldName) ?? ""
            },
            set: { newValue in
                guard let fieldName = fieldManager.name else { return }
                form.setValueByFieldName(newValue, forField: fieldName)
            }
        )
        
        let handleTextChange: (String) -> Void = { newValue in
            guard let fieldName = fieldManager.name else { return }
            var refinedValue = newValue
            if let format = fpInputProps.format, !refinedValue.isEmpty {
                refinedValue = format(refinedValue)
            }
            if let maxLengthLimit = fpInputProps.maxLength {
                refinedValue = String(refinedValue.prefix(maxLengthLimit))
            }
            binding.wrappedValue = refinedValue
        }
        
        return Group {
            if let customTextField = asCustomTextField {
                customTextField(binding, handleTextChange)
                    .keyboardType(fpInputProps.keyboardType ?? .default)
                    .textContentType(fpInputProps.textContentType)
                    .autocapitalization(fpInputProps.autocapitalization ?? .sentences)
            } else {
                TextField(placeholder ?? "", text: binding)
                    .keyboardType(fpInputProps.keyboardType ?? .default)
                    .textContentType(fpInputProps.textContentType)
                    .autocapitalization(fpInputProps.autocapitalization ?? .sentences)
                    .onChange(of: binding.wrappedValue){ newValue in
                        handleTextChange(newValue)
                    }
            }
        }
        
        .onAppear(perform: UIApplication.shared.addTapGestureRecognizer)
    }
}


// Extension to add a tap gesture recognizer for dismissing the keyboard
extension UIApplication {
    func addTapGestureRecognizer() {
        guard let window = windows.first else { return }
        let tapGesture = UITapGestureRecognizer(target: window, action: #selector(UIView.endEditing))
        tapGesture.requiresExclusiveTouchType = false
        tapGesture.cancelsTouchesInView = false
        tapGesture.delegate = self
        window.addGestureRecognizer(tapGesture)
    }
}

extension UIApplication: UIGestureRecognizerDelegate {
    public func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        return false
    }
}
