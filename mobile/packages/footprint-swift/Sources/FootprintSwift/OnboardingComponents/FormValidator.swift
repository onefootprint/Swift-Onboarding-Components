import SwiftUI
import FormValidator
import Combine

public class FormValidator: ObservableObject {
 
    // 2
    @Published
    var manager = FormManager(validationType: .silent)
    
    // 3
    @FormField(validator: EmailValidator(message: "This field is required!"))
    var email: String = ""
    
    // 3
    @FormField(validator: NonEmptyValidator(message: "This field is required!"))
    var phoneNumber: String = ""
    
    // 4
    lazy var emailValidation = _email.validation(manager: manager)
    
    lazy var phoneNumberValidation = _phoneNumber.validation(manager: manager)
}
