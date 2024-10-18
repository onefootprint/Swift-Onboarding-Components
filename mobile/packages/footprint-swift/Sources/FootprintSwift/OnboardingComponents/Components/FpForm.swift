import SwiftUI

public struct FpForm<Content: View, SubmitButton: View>: View {
    @StateObject var form = FormManager()
    @State private var isSubmitPressed = false
    let content: Content
    let spacing: CGFloat
    let alignment: HorizontalAlignment
    let onSubmit: ((VaultData) -> Void)?
    let submitButtonBuilder: (() -> SubmitButton)?
    
    public init(
        spacing: CGFloat = 16,
        alignment: HorizontalAlignment = .leading,
        onSubmit: ((VaultData) -> Void)? = nil,
        @ViewBuilder content: () -> Content,
        @ViewBuilder submitButton: @escaping (() -> SubmitButton)
    ) {
        self.spacing = spacing
        self.alignment = alignment
        self.onSubmit = onSubmit
        self.content = content()
        self.submitButtonBuilder = submitButton
    }
    
    public var body: some View {
        VStack(alignment: alignment, spacing: spacing) {
            content
            if let onSubmit = onSubmit, let submitButtonBuilder = submitButtonBuilder {
                submitButtonBuilder()
                    .onTapGesture {
                        isSubmitPressed = true
                        form.triggerValidation()
                        
                        if form.isValid{
                            print("Email info:  \(form.idEmail)")
                            print("Phone info: \(form.idPhoneNumber)")
                            print("Vault data \(form.getVaultData())")
                        }
                    }
            }
        }
        .environmentObject(form)
    }
}
