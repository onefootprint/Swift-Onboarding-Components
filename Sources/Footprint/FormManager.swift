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
            if let err = getValidations(fieldName: .idEmail)(idEmail){
                errors["idEmail"] = err
            }
        }
        if fieldsUsed.contains("idPhoneNumber"){
            if let err = getValidations(fieldName: .idPhoneNumber)(idPhoneNumber){
                errors["idPhoneNumber"] = err
            }
        }
        if fieldsUsed.contains("idDob"){
            if let err = getValidations(fieldName: .idDob)(idDob){
                errors["idDob"] = err
            }
        }
        if fieldsUsed.contains("idSsn4"){
            if let err = getValidations(fieldName: .idSsn4)(idSsn4){
                errors["idSsn4"] = err
            }
        }
        if fieldsUsed.contains("idSsn9"){
            if let err = getValidations(fieldName: .idSsn9)(idSsn9){
                errors["idSsn9"] = err
            }
        }
        if fieldsUsed.contains("idFirstName"){
            if let err = getValidations(fieldName: .idFirstName)(idFirstName){
                errors["idFirstName"] = err
            }
        }
        if fieldsUsed.contains("idLastName"){
            if let err = getValidations(fieldName: .idLastName)(idLastName){
                errors["idLastName"] = err
            }
        }
        if fieldsUsed.contains("idMiddleName"){
            if let err = getValidations(fieldName: .idMiddleName)(idMiddleName){
                errors["idMiddleName"] = err
            }
        }
        if fieldsUsed.contains("idCountry"){
            if let err = getValidations(fieldName: .idCountry)(idCountry){
                errors["idCountry"] = err
            }
        }
        if fieldsUsed.contains("idState"){
            if let err = getValidations(fieldName: .idState)(idState){
                errors["idState"] = err
            }
        }
        if fieldsUsed.contains("idCity"){
            if let err = getValidations(fieldName: .idCity)(idCity){
                errors["idCity"] = err
            }
        }
        if fieldsUsed.contains("idZip"){
            if let err = getValidations(fieldName: .idZip)(idZip){
                errors["idZip"] = err
            }
        }
        if fieldsUsed.contains("idAddressLine1"){
            if let err = getValidations(fieldName: .idAddressLine1)(idAddressLine1){
                errors["idAddressLine1"] = err
            }
        }
        if fieldsUsed.contains("idAddressLine2"){
            if let err = getValidations(fieldName: .idAddressLine2)(idAddressLine2){
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
    
    func setValueByFieldName(_ value: String, forField: FpFieldName){
        switch forField {
        case .idEmail:
            setValue(value, forKey: "idEmail")
        case .idPhoneNumber:
            setValue(value, forKey: "idPhoneNumber")
        case .idDob:
            setValue(value, forKey: "idDob")
        case .idSsn4:
            setValue(value, forKey: "idSsn4")
        case .idSsn9:
            setValue(value, forKey: "idSsn9")
        case .idFirstName:
            setValue(value, forKey: "idFirstName")
        case .idLastName:
            setValue(value, forKey: "idLastName")
        case .idMiddleName:
            setValue(value, forKey: "idMiddleName")
        case .idCountry:
            setValue(value, forKey: "idCountry")
        case .idState:
            setValue(value, forKey: "idState")
        case .idCity:
            setValue(value, forKey: "idCity")
        case .idZip:
            setValue(value, forKey: "idZip")
        case .idAddressLine1:
            setValue(value, forKey: "idAddressLine1")
        case .idAddressLine2:
            setValue(value, forKey: "idAddressLine2")
        default:
            break
        }
    }
    
    func getValueByFieldName(_ forField: FpFieldName) -> String? {
        switch forField {
        case .idEmail:
            return idEmail
        case .idPhoneNumber:
            return idPhoneNumber
        case .idDob:
            return idDob
        case .idSsn4:
            return idSsn4
        case .idSsn9:
            return idSsn9
        case .idFirstName:
            return idFirstName
        case .idLastName:
            return idLastName
        case .idMiddleName:
            return idMiddleName
        case .idCountry:
            return idCountry
        case .idState:
            return idState
        case .idCity:
            return idCity
        case .idZip:
            return idZip
        case .idAddressLine1:
            return idAddressLine1
        case .idAddressLine2:
            return idAddressLine2
        default:
            return nil
        }
    }
    
    
    func getVaultData() -> VaultData {
        return VaultData.createVault(
            idAddressLine1: idAddressLine1.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idAddressLine1,
            idAddressLine2: idAddressLine2.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idAddressLine2,            
            idCity: idCity.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idCity,
            idCountry: idCountry.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idCountry,
            idDob: idDob.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idDob,
            idEmail: idEmail.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idEmail,
            idFirstName: idFirstName.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idFirstName,
            idLastName: idLastName.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idLastName,
            idMiddleName: idMiddleName.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idMiddleName,
            idPhoneNumber: idPhoneNumber.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idPhoneNumber,
            idSsn4: idSsn4.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idSsn4,
            idSsn9: idSsn9.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idSsn9,
            idState: idState.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idState,
            idZip: idZip.trimmingCharacters(in: .whitespaces).isEmpty ? nil : idZip            
        )
    }
    
    func getErrorByFieldName(fieldName: FpFieldName) -> String? {
        switch fieldName {
        case .idPhoneNumber:
            return errors["idPhoneNumber"]
        case .idEmail:
            return errors["idEmail"]
        case .idDob:
            return errors["idDob"]
        case .idSsn4:
            return errors["idSsn4"]
        case .idSsn9:
            return errors["idSsn9"]
        case .idFirstName:
            return errors["idFirstName"]
        case .idLastName:
            return errors["idLastName"]
        case .idMiddleName:
            return errors["idMiddleName"]
        case .idCountry:
            return errors["idCountry"]
        case .idState:
            return errors["idState"]
        case .idCity:
            return errors["idCity"]
        case .idZip:
            return errors["idZip"]
        case .idAddressLine1:
            return errors["idAddressLine1"]
        case .idAddressLine2:
            return errors["idAddressLine2"]
        default:
            return nil
        }
    }
    
    func addToFieldsUsed(_ fieldName: FpFieldName) {
        switch fieldName {
        case .idPhoneNumber:
            fieldsUsed.insert("idPhoneNumber")
        case .idEmail:
            fieldsUsed.insert("idEmail")
        case .idDob:
            fieldsUsed.insert("idDob")
        case .idSsn4:
            fieldsUsed.insert("idSsn4")
        case .idSsn9:
            fieldsUsed.insert("idSsn9")
        case .idFirstName:
            fieldsUsed.insert("idFirstName")
        case .idLastName:
            fieldsUsed.insert("idLastName")
        case .idMiddleName:
            fieldsUsed.insert("idMiddleName")
        case .idCountry:
            fieldsUsed.insert("idCountry")
        case .idState:
            fieldsUsed.insert("idState")
        case .idCity:
            fieldsUsed.insert("idCity")
        case .idZip:
            fieldsUsed.insert("idZip")
        case .idAddressLine1:
            fieldsUsed.insert("idAddressLine1")
        case .idAddressLine2:
            fieldsUsed.insert("idAddressLine2")
        default:
            break
        }
    }
    
    func setDefaultValues(defaultValues: [FpFieldName: String?]) {
        // Setting default values doesn't automatically add the field key to used keys
        // The field should be a part of used keys only if it's used in the UI
        for (key, value) in defaultValues {
            switch key {
            case .idPhoneNumber:
                idPhoneNumber = value ?? idPhoneNumber
            case .idEmail:
                idEmail = value ?? idEmail
            case .idDob:
                idDob = value ?? idDob
            case .idSsn4:
                idSsn4 = value ?? idSsn4
            case .idSsn9:
                idSsn9 = value ?? idSsn9
            case .idFirstName:
                idFirstName = value ?? idFirstName
            case .idLastName:
                idLastName = value ?? idLastName
            case .idMiddleName:
                idMiddleName = value ?? idMiddleName
            case .idCountry:
                idCountry = value ?? idCountry
            case .idState:
                idState = value ?? idState
            case .idCity:
                idCity = value ?? idCity
            case .idZip:
                idZip = value ?? idZip
            case .idAddressLine1:
                idAddressLine1 = value ?? idAddressLine1
            case .idAddressLine2:
                idAddressLine2 = value ?? idAddressLine2
            default:
                break
            }
        }
    }
}
