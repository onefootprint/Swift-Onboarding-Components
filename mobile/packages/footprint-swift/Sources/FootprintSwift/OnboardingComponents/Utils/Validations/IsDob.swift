import Foundation

let DOB_MIN_AGE = 18
let DOB_MAX_AGE = 120

func getMonthYearDateString(date: String, locale: FootprintLocale) -> [String: String] {
    let dayIndex = (locale == .enUS) ? 1 : 0
    let monthIndex = (locale == .enUS) ? 0 : 1
    let yearIndex = 2
    
    let dateArray = date.split(separator: "/").map { String($0) }
    guard dateArray.count == 3, dayIndex >= 0, monthIndex >= 0, yearIndex >= 0 else {
        return ["day": "", "month": "", "year": ""]
    }
    
    let day = dateArray[dayIndex]
    let month = dateArray[monthIndex]
    let year = dateArray[yearIndex]
    
    return ["day": day, "month": month, "year": year]
}

func validateFormat(dateComponents: [String: String]) -> Bool {
    guard let dayString = dateComponents["day"],
          let dayNumber = Int(dayString),
          dayNumber >= 1, dayNumber <= 31, dayString.count == 2 else {
        return false
    }
    
    guard let monthString = dateComponents["month"],
          let monthNumber = Int(monthString),
          monthNumber >= 1, monthNumber <= 12, monthString.count == 2 else {
        return false
    }
    
    guard let yearString = dateComponents["year"],
          let yearNumber = Int(yearString),
          yearString.count == 4 else {
        return false
    }
    
    return true
}

func isDobTooYoung(_ date: Date, today: Date = Date()) -> Bool {
    let age = Calendar.current.dateComponents([.year], from: date, to: today).year ?? 0
    return age < DOB_MIN_AGE
}

func isDobTooOld(_ date: Date, today: Date = Date()) -> Bool {
    let age = Calendar.current.dateComponents([.year], from: date, to: today).year ?? 0
    return age > DOB_MAX_AGE
}

func isDobInTheFuture(_ date: Date, today: Date = Date()) -> Bool {
    return date >= today
}

func isDob(_ dob: String, locale: FootprintLocale, translation: Translation?) -> String? {
    if dob.isEmpty {
        return translation?.dob?.required ?? "Date of birth is required"
    }
    
    let today = Date()
    let dateComponents = getMonthYearDateString(date: dob, locale: locale)
    let isCorrectFormat = validateFormat(dateComponents: dateComponents)
    let correctFormat = locale == .enUS ? "MM/DD/YYYY" : "DD/MM/YYYY"
    if(!isCorrectFormat) { return translation?.dob?.invalid ?? "Invalid date format. Please use \(correctFormat)" }
    
    // Ensure day and month are padded to two digits
    let day = String(format: "%02d", Int(dateComponents["day"]!)!)
    let month = String(format: "%02d", Int(dateComponents["month"]!)!)
    let year = dateComponents["year"]!
    
    let isoFormatDate = "\(year)-\(month)-\(day)"
    
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "yyyy-MM-dd"
    dateFormatter.locale = Locale(identifier: "en_US_POSIX")
    dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
    
    guard let date = dateFormatter.date(from: isoFormatDate) else {
        return translation?.dob?.invalid ?? "Invalid date. Please use \(correctFormat)"
    }
    
    let isTooYoung = isDobTooYoung(date, today: today)
    let isTooOld = isDobTooOld(date, today: today)
    let isInTheFuture = isDobInTheFuture(date, today: today)
    
    if (isTooYoung) { return translation?.dob?.tooYoung ?? "Too young. Minimum age is \(DOB_MIN_AGE)" }
    if (isTooOld) { return translation?.dob?.tooOld ?? "Too old. Maximum age is \(DOB_MAX_AGE)" }
    if (isInTheFuture) { return translation?.dob?.inTheFuture ?? "In the future. Please use a valid date" }
    
    return nil
}
