import SwiftUI
import Combine

@available(iOS 15.0, *)
public struct PinInputField: View {
    @State private var digits: [String] = Array(repeating: "\u{200B}", count: 6) // Start with empty strings
    @FocusState private var focusedFieldIndex: Int?
    
    var onComplete: ((String) -> Void)?

    public init(onComplete: ((String) -> Void)? = nil) {
        self.onComplete = onComplete
    }

    public var body: some View {
        HStack(spacing: 10) {
            ForEach(0..<6, id: \.self) { index in
                SingleDigitInput(
                    digit: $digits[index],
                    focusedIndex: $focusedFieldIndex,
                    index: index,
                    onComplete: {
                        handleInput(at: index)
                    },
                    onBackspace: {
                        handleBackspace(at: index)
                    }
                )
            }
        }
        .onAppear {
            focusedFieldIndex = 0 // Set initial focus to the first field
        }
    }
    
    private func handleInput(at index: Int) {
        // Move to the next field if there is one
        if index < 5 && !digits[index].isEmpty {
            focusedFieldIndex = index + 1
        }
        var pinCode = digits.joined().filter(\.isNumber)
        if pinCode.count == digits.count {
            onComplete?(pinCode)
        }
    }

    private func handleBackspace(at index: Int) {
        if index > 0 {
            focusedFieldIndex = index - 1
        }
    }
}

// SingleDigitInput component
@available(iOS 15.0, *)
struct SingleDigitInput: View {
    @Binding var digit: String
    @FocusState.Binding var focusedIndex: Int?
    let index: Int
    var onComplete: (() -> Void)?
    var onBackspace: (() -> Void)?

    var body: some View {
        TextField("", text: $digit)
            .keyboardType(.numberPad)
            .textFieldStyle(.plain)
            .frame(width: 40, height: 40)
            .multilineTextAlignment(.center)
            .font(.system(size: 20))
            .background(Color.white)
            .overlay(
                RoundedRectangle(cornerRadius: 5)
                    .stroke(Color.gray, lineWidth: 1)
            )
            .focused($focusedIndex, equals: index) // Bind focus state directly
            .onChange(of: digit) { [prevValue = digit] newValue in
                if prevValue == "\u{200B}" && newValue.isEmpty {
                    digit = "\u{200B}"
                    onBackspace?()
                    return
                } else if newValue.isEmpty {
                    digit = "\u{200B}"
                    return
                }
                
                if newValue.count > 1 {
                    var numericChar = ""
                    newValue.forEach({char in
                        if char.isNumber {
                            numericChar = String(char)
                        }
                    })
                    if !numericChar.isEmpty {
                        digit = numericChar
                        onComplete?()
                    }else{
                        digit = "\u{200B}"
                    }
                }
            }
    }
}
