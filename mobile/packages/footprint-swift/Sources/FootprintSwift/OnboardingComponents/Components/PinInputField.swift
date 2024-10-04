import SwiftUI
import Combine

public struct PinInputField: View {
    @Binding public var pin: String
    public let maxDigits: Int = 6
    @State private var focusedField: Int = 0
    
    public init(pin: Binding<String>) {
        self._pin = pin
    }
    
    public var body: some View {
        HStack(spacing: 10) {
            ForEach(0..<maxDigits, id: \.self) { index in
                TextField("", text: Binding(
                    get: { String(pin.count > index ? String(pin[pin.index(pin.startIndex, offsetBy: index)]) : "") },
                    set: { newValue in
                        let filtered = newValue.filter { "0123456789".contains($0) }
                        if filtered.count == 1 {
                            if pin.count > index {
                                pin.replaceSubrange(pin.index(pin.startIndex, offsetBy: index)...pin.index(pin.startIndex, offsetBy: index), with: filtered)
                            } else {
                                pin += filtered
                            }
                            if index < maxDigits - 1 {
                                focusedField = index + 1
                            }
                        } else if filtered.isEmpty && !pin.isEmpty {
                            if index < pin.count {
                                pin.remove(at: pin.index(pin.startIndex, offsetBy: index))
                            }
                            if index > 0 {
                                focusedField = index - 1
                            }
                        }
                    }
                ))
                .frame(width: 40, height: 50)
                .multilineTextAlignment(.center)
                .keyboardType(.numberPad)
                .background(RoundedRectangle(cornerRadius: 8).stroke(Color.gray, lineWidth: 1))
                .onChange(of: focusedField) { newValue in
                    if newValue == index {
                        DispatchQueue.main.async {
                            UIApplication.shared.sendAction(#selector(UIResponder.becomeFirstResponder), to: nil, from: nil, for: nil)
                        }
                    }
                }
            }
        }
        .onReceive(Just(pin)) { _ in
            limitText(maxDigits)
        }
    }
    
    private func limitText(_ upper: Int) {
        if pin.count > upper {
            pin = String(pin.prefix(upper))
        }
    }
}
