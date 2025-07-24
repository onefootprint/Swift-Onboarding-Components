import SwiftUI

public struct FpLabel: View {
    let text: String
    let font: Font
    let color: Color
    let alignment: TextAlignment
    
    public init(
        _ text: String,
        font: Font = .body,
        color: Color = .primary,
        alignment: TextAlignment = .leading
    ) {
        self.text = text
        self.font = font
        self.color = color
        self.alignment = alignment
    }
    
    public var body: some View {
        Text(text)
            .font(font)
            .foregroundColor(color)
            .multilineTextAlignment(alignment)
    }
}

struct FpLabel_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 20) {
            FpLabel("Default Label")
            
            FpLabel("Custom Font Label", font: .headline)
            
            FpLabel("Custom Color Label", color: .blue)
            
            FpLabel("Right Aligned Label", alignment: .trailing)
                .frame(maxWidth: .infinity, alignment: .trailing)
            
            FpLabel("Multiline Label with custom font and color", font: .subheadline, color: .green)
                .frame(width: 200)
        }
        .padding()
    }
}
