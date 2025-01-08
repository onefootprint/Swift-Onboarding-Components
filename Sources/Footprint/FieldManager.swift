import Combine

class FieldManager: ObservableObject {
    @Published var name: FpFieldName? {
        didSet { objectWillChange.send() }
    }
    
    func setName(_ name: FpFieldName) {
        self.name = name
    }
}
