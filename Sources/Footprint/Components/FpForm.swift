import SwiftUI

public struct FormUtils {
    public var handleSubmit: () -> Void
    public var setValue: (_ value: String, _ forField: FpFieldName) -> Void
    public var getError: (FpFieldName) -> String?
    
    init(handleSubmit: @escaping (() -> Void),
         setValue: @escaping (_ value: String, _ forField: FpFieldName) -> Void,
         getError: @escaping (FpFieldName) -> String?) {
        self.handleSubmit = handleSubmit
        self.setValue = setValue
        self.getError = getError
    }
}

public struct FpForm<Content: View>: View {
    @StateObject var form = FormManager()
    var defaultValues: [FpFieldName: String?]? = nil
    let builder: (FormUtils) -> Content
    let onSubmit: (VaultData) -> Void
    
    
    public init(
        defaultValues: [FpFieldName: String?]? = nil,
        onSubmit: @escaping (VaultData) -> Void,
        @ViewBuilder builder: @escaping (FormUtils) -> Content
    ) {
        self.builder = builder
        self.onSubmit = onSubmit
        self.defaultValues = defaultValues
    }
    
    public var body: some View {
        VStack {
            self.builder(.init(
                handleSubmit: {
                    form.triggerValidation()
                    if form.isValid {
                        self.onSubmit(form.getVaultData())
                    }
                },
                setValue: { value, field in
                    form.setValueByFieldName(value, forField: field)
                },
                getError: { field in
                    form.getErrorByFieldName(fieldName: field)
                }
            ))
        }
        .environmentObject(form)
        .onAppear(){
            form.setDefaultValues(defaultValues: defaultValues ?? [:])
        }
    }
}
