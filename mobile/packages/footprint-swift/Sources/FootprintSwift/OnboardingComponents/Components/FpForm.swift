import SwiftUI

public struct FpForm<Content: View, SubmitButton: View>: View {
    @StateObject var form = FormValidator()
    let content: Content
    let spacing: CGFloat
    let alignment: HorizontalAlignment
    let onSubmit: (() -> Void)?
    let submitButtonBuilder: (() -> SubmitButton)?
    
    public init(
        spacing: CGFloat = 16,
        alignment: HorizontalAlignment = .leading,
        onSubmit: (() -> Void)? = nil,
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
                         let valid = form.manager.triggerValidation()
                        
                    

                         if valid {
                             onSubmit()
                         }
                                                                                            
                        
                        // // Another way for checking validation.
                        // print("Is all valid: \(form.manager.isAllValid())")
                        
                        // // Check if all fields have text. This is not validation check.
                        // print("Is all filled: \(form.manager.isAllFilled())")
                        
                        // // Get an array with all validation messages.
                        // print("All validation messages array: \(form.manager.validationMessages)")
                        
                        // // Get error messages as string, separated with a new line.
                        // print("All validation messages string: \(form.manager.errorsDescription())")                                                
                        
                    }
            }
        }
        .environmentObject(form)
    }
}

