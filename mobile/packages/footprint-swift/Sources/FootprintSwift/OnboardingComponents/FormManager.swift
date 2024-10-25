import Combine

class FormManager: ObservableObject {
    // We should use the set function to set them, not directly
    @Published private(set) var idEmail: String = "" {
        didSet { objectWillChange.send() }
    }
    @Published private(set) var idPhoneNumber: String = "" {
        didSet { objectWillChange.send() }
    }
    @Published private(set) var idDob: String = "" {
        didSet { objectWillChange.send() }
    }
    @Published private(set) var idSsn4: String = "" {
        didSet { objectWillChange.send() }
    }
    @Published private(set) var idSsn9: String = "" {
        didSet { objectWillChange.send() }
    }
    @Published private(set) var idFirstName: String = "" {
        didSet { objectWillChange.send() }
    }
    @Published private(set) var idLastName: String = "" {
        didSet { objectWillChange.send() }
    }
    @Published private(set) var idMiddleName: String = "" {
        didSet { objectWillChange.send() }
    }
    @Published private(set) var idCountry: String = "" {
        didSet { objectWillChange.send() }
    }
    @Published private(set) var idState: String = "" {
        didSet { objectWillChange.send() }
    }
    @Published private(set) var idCity: String = "" {
        didSet { objectWillChange.send() }
    }
    @Published private(set) var idZip: String = "" {
        didSet { objectWillChange.send() }
    }
    @Published private(set) var idAddressLine1: String = "" {
        didSet { objectWillChange.send() }
    }
    @Published private(set) var idAddressLine2: String = "" {
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
        if fieldsUsed.contains("idEmail"){
            if let err = getValidations(fieldName: .idPeriodEmail)(idEmail){
                errors["idEmail"] = err
            }
        }
        if fieldsUsed.contains("idPhoneNumber"){
            if let err = getValidations(fieldName: .idPeriodPhoneNumber)(idPhoneNumber){
                errors["idPhoneNumber"] = err
            }
        }
        if fieldsUsed.contains("idDob"){
            if let err = getValidations(fieldName: .idPeriodDob)(idDob){
                errors["idDob"] = err
            }
        }
        if fieldsUsed.contains("idSsn4"){
            if let err = getValidations(fieldName: .idPeriodSsn4)(idSsn4){
                errors["idSsn4"] = err
            }
        }
        if fieldsUsed.contains("idSsn9"){
            if let err = getValidations(fieldName: .idPeriodSsn9)(idSsn9){
                errors["idSsn9"] = err
            }
        }
        if fieldsUsed.contains("idFirstName"){
            if let err = getValidations(fieldName: .idPeriodFirstName)(idFirstName){
                errors["idFirstName"] = err
            }
        }
        if fieldsUsed.contains("idLastName"){
            if let err = getValidations(fieldName: .idPeriodLastName)(idLastName){
                errors["idLastName"] = err
            }
        }
        if fieldsUsed.contains("idMiddleName"){
            if let err = getValidations(fieldName: .idPeriodMiddleName)(idMiddleName){
                errors["idMiddleName"] = err
            }
        }
        if fieldsUsed.contains("idCountry"){
            if let err = getValidations(fieldName: .idPeriodCountry)(idCountry){
                errors["idCountry"] = err
            }
        }
        if fieldsUsed.contains("idState"){
            if let err = getValidations(fieldName: .idPeriodState)(idState){
                errors["idState"] = err
            }
        }
        if fieldsUsed.contains("idCity"){
            if let err = getValidations(fieldName: .idPeriodCity)(idCity){
                errors["idCity"] = err
            }
        }
        if fieldsUsed.contains("idZip"){
            if let err = getValidations(fieldName: .idPeriodZip)(idZip){
                errors["idZip"] = err
            }
        }
        if fieldsUsed.contains("idAddressLine1"){
            if let err = getValidations(fieldName: .idPeriodAddressLine1)(idAddressLine1){
                errors["idAddressLine1"] = err
            }
        }
        if fieldsUsed.contains("idAddressLine2"){
            if let err = getValidations(fieldName: .idPeriodAddressLine2)(idAddressLine2){
                errors["idAddressLine2"] = err
            }
        }
        return errors
    }
    
    var isValid: Bool {
        errors.isEmpty
    }
    
    func triggerValidation() {
        shouldValidate = true
    }
    
    
    init(idEmail: String = "",
         idPhoneNumber: String = "",
         idDob: String = "",
         idSsn4: String = "",
         idSsn9: String = "",
         idFirstName: String = "",
         idLastName: String = "",
         idMiddleName: String = "",
         idCountry: String = "",
         idState: String = "",
         idCity: String = "",
         idZip: String = "",
         idAddressLine1: String = "",
         idAddressLine2: String = "") {
        self.idEmail = idEmail
        self.idPhoneNumber = idPhoneNumber
        self.idDob = idDob
        self.idSsn4 = idSsn4
        self.idSsn9 = idSsn9
        self.idFirstName = idFirstName
        self.idLastName = idLastName
        self.idMiddleName = idMiddleName
        self.idCountry = idCountry
        self.idState = idState
        self.idCity = idCity
        self.idZip = idZip
        self.idAddressLine1 = idAddressLine1
        self.idAddressLine2 = idAddressLine2
    }
    
    func setValue(_ value: String, forKey key: String) {
        switch key {
        case "idEmail":
            idEmail = value
            fieldsUsed.insert(key)
        case "idPhoneNumber":
            idPhoneNumber = value
            fieldsUsed.insert(key)
        case "idDob":
            idDob = value
            fieldsUsed.insert(key)
        case "idSsn4":
            idSsn4 = value
            fieldsUsed.insert(key)
        case "idSsn9":
            idSsn9 = value
            fieldsUsed.insert(key)
        case "idFirstName":
            idFirstName = value
            fieldsUsed.insert(key)
        case "idLastName":
            idLastName = value
            fieldsUsed.insert(key)
        case "idMiddleName":
            idMiddleName = value
            fieldsUsed.insert(key)
        case "idCountry":
            idCountry = value
            fieldsUsed.insert(key)
        case "idState":
            idState = value
            fieldsUsed.insert(key)
        case "idCity":
            idCity = value
            fieldsUsed.insert(key)
        case "idZip":
            idZip = value
            fieldsUsed.insert(key)
        case "idAddressLine1":
            idAddressLine1 = value
            fieldsUsed.insert(key)
        case "idAddressLine2":
            idAddressLine2 = value
            fieldsUsed.insert(key)
        default:
            break
        }
    }
    
    func setValueByVaultDI(_ value: String, forDi: VaultDI){
        switch forDi {
        case .idPeriodEmail:
            setValue(value, forKey: "idEmail")
        case .idPeriodPhoneNumber:
            setValue(value, forKey: "idPhoneNumber")
        case .idPeriodDob:
            setValue(value, forKey: "idDob")
        case .idPeriodSsn4:
            setValue(value, forKey: "idSsn4")
        case .idPeriodSsn9:
            setValue(value, forKey: "idSsn9")
        case .idPeriodFirstName:
            setValue(value, forKey: "idFirstName")
        case .idPeriodLastName:
            setValue(value, forKey: "idLastName")
        case .idPeriodMiddleName:
            setValue(value, forKey: "idMiddleName")
        case .idPeriodCountry:
            setValue(value, forKey: "idCountry")
        case .idPeriodState:
            setValue(value, forKey: "idState")
        case .idPeriodCity:
            setValue(value, forKey: "idCity")
        case .idPeriodZip:
            setValue(value, forKey: "idZip")
        case .idPeriodAddressLine1:
            setValue(value, forKey: "idAddressLine1")
        case .idPeriodAddressLine2:
            setValue(value, forKey: "idAddressLine2")
        default:
            break
        }
    }
    
    func getValueByVaultDi(_ forDi: VaultDI) -> String? {
        switch forDi {
        case .idPeriodEmail:
            return idEmail
        case .idPeriodPhoneNumber:
            return idPhoneNumber
        case .idPeriodDob:
            return idDob
        case .idPeriodSsn4:
            return idSsn4
        case .idPeriodSsn9:
            return idSsn9
        case .idPeriodFirstName:
            return idFirstName
        case .idPeriodLastName:
            return idLastName
        case .idPeriodMiddleName:
            return idMiddleName
        case .idPeriodCountry:
            return idCountry
        case .idPeriodState:
            return idState
        case .idPeriodCity:
            return idCity
        case .idPeriodZip:
            return idZip
        case .idPeriodAddressLine1:
            return idAddressLine1
        case .idPeriodAddressLine2:
            return idAddressLine2
        default:
            return nil
        }
    }
    
    
    func getVaultData() -> VaultData {
        var vaultData: VaultData = VaultData()
        for key in fieldsUsed {
            switch key {
            case "idEmail":
                vaultData.idEmail = idEmail.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idEmail
            case "idPhoneNumber":
                vaultData.idPhoneNumber = idPhoneNumber.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idPhoneNumber
            case "idDob":
                vaultData.idDob = idDob.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idDob
            case "idSsn4":
                vaultData.idSsn4 = idSsn4.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idSsn4
            case "idSsn9":
                vaultData.idSsn9 = idSsn9.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idSsn9
            case "idFirstName":
                vaultData.idFirstName = idFirstName.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idFirstName
            case "idLastName":
                vaultData.idLastName = idLastName.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idLastName
            case "idMiddleName":
                vaultData.idMiddleName = idMiddleName.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idMiddleName
            case "idCountry":
                vaultData.idCountry = idCountry.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idCountry
            case "idState":
                vaultData.idState = idState.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idState
            case "idCity":
                vaultData.idCity = idCity.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idCity
            case "idZip":
                vaultData.idZip = idZip.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idZip
            case "idAddressLine1":
                vaultData.idAddressLine1 = idAddressLine1.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idAddressLine1
            case "idAddressLine2":
                vaultData.idAddressLine2 = idAddressLine2.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idAddressLine2
            default:
                break
            }
        }
        return vaultData
    }
    
    func getErrorByVaultDI(fieldName: VaultDI) -> String? {
        switch fieldName {
        case .idPeriodPhoneNumber:
            return errors["idPhoneNumber"]
        case .idPeriodEmail:
            return errors["idEmail"]
        case .idPeriodDob:
            return errors["idDob"]
        case .idPeriodSsn4:
            return errors["idSsn4"]
        case .idPeriodSsn9:
            return errors["idSsn9"]
        case .idPeriodFirstName:
            return errors["idFirstName"]
        case .idPeriodLastName:
            return errors["idLastName"]
        case .idPeriodMiddleName:
            return errors["idMiddleName"]
        case .idPeriodCountry:
            return errors["idCountry"]
        case .idPeriodState:
            return errors["idState"]
        case .idPeriodCity:
            return errors["idCity"]
        case .idPeriodZip:
            return errors["idZip"]
        case .idPeriodAddressLine1:
            return errors["idAddressLine1"]
        case .idPeriodAddressLine2:
            return errors["idAddressLine2"]
        default:
            return nil
        }
    }
    
    func addToFieldsUsed(_ fieldName: VaultDI) {
        switch fieldName {
        case .idPeriodPhoneNumber:
            fieldsUsed.insert("idPhoneNumber")
        case .idPeriodEmail:
            fieldsUsed.insert("idEmail")
        case .idPeriodDob:
            fieldsUsed.insert("idDob")
        case .idPeriodSsn4:
            fieldsUsed.insert("idSsn4")
        case .idPeriodSsn9:
            fieldsUsed.insert("idSsn9")
        case .idPeriodFirstName:
            fieldsUsed.insert("idFirstName")
        case .idPeriodLastName:
            fieldsUsed.insert("idLastName")
        case .idPeriodMiddleName:
            fieldsUsed.insert("idMiddleName")
        case .idPeriodCountry:
            fieldsUsed.insert("idCountry")
        case .idPeriodState:
            fieldsUsed.insert("idState")
        case .idPeriodCity:
            fieldsUsed.insert("idCity")
        case .idPeriodZip:
            fieldsUsed.insert("idZip")
        case .idPeriodAddressLine1:
            fieldsUsed.insert("idAddressLine1")
        case .idPeriodAddressLine2:
            fieldsUsed.insert("idAddressLine2")
        default:
            break
        }
    }
}
