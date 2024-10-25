func formatPhoneNumber(_ number: String) -> String {
    // Remove non-numeric characters
    let digits = number.filter { "0123456789".contains($0) }
    
    // Start formatting with a leading '+'
    var formattedNumber = "+"
    
    // Append the digits
    formattedNumber.append(digits)
    
    return formattedNumber
}

func formatDate(_ date: String) -> String {
    let cleanInput = date.replacingOccurrences(of: "[^0-9]", with: "", options: .regularExpression)
    
    var result = ""
    let mask = "##/##/####"
    
    var index = cleanInput.startIndex
    for ch in mask {
        if index == cleanInput.endIndex {
            break
        }
        if ch == "#" {
            result.append(cleanInput[index])
            index = cleanInput.index(after: index)
        } else {
            result.append(ch)
        }
    }
    
    return result
}

func formatSsn9(_ ssn: String) -> String {
    // Remove any non-numeric characters from the input
    let cleanInput = ssn.replacingOccurrences(of: "[^0-9]", with: "", options: .regularExpression)
    
    var result = ""
    let mask = "###-##-####"
    
    var index = cleanInput.startIndex
    for ch in mask {
        if index == cleanInput.endIndex {
            break
        }
        if ch == "#" {
            result.append(cleanInput[index])
            index = cleanInput.index(after: index)
        } else {
            result.append(ch)
        }
    }
    
    return result
}

