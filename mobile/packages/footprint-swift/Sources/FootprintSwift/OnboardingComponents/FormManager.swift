import Combine

class FormManager: ObservableObject {
    // We should use the set function to set them, not directly
    @Published private(set) var idEmail: String = "" {
        didSet { objectWillChange.send() }
    }
    @Published private(set) var idPhoneNumber: String = "" {
        didSet { objectWillChange.send() }
    }
    @Published var shouldValidate: Bool = false {
        didSet { objectWillChange.send() }
    }
    private var fieldsUsed: Set<String> = []
    
    // Add error validation and store it in a dictionary
    var errors: [String: String]{
        guard shouldValidate else {
            return [:]
        }
        var errors = [String: String]()
        if idEmail.isEmpty == true {
            errors["idEmail"] = "Email is required. Please provide an email address"
        }
        if idPhoneNumber.isEmpty == true {
            errors["idPhoneNumber"] = "Phone number is required"
        }
        return errors
    }
    
    var isValid: Bool {
        errors.isEmpty
    }
    
    func triggerValidation() {
        shouldValidate = true
    }
    
    
    init(idEmail: String = "", idPhoneNumber: String = "") {
        self.idEmail = idEmail
        self.idPhoneNumber = idPhoneNumber
    }
    
    func setValue(_ value: String, forKey key: String) {
        switch key {
        case "idEmail":
            idEmail = value
            fieldsUsed.insert(key)
        case "idPhoneNumber":
            idPhoneNumber = value
            fieldsUsed.insert(key)
        default:
            break
        }
    }
    
    
    func getVaultData() -> VaultData {
        var vaultData: VaultData = VaultData()
        for key in fieldsUsed {
            switch key {
            case "idEmail":
                vaultData.idEmail = idEmail
            case "idPhoneNumber":
                vaultData.idPhoneNumber = idPhoneNumber
            default:
                break
            }
        }
        return vaultData
    }
}
