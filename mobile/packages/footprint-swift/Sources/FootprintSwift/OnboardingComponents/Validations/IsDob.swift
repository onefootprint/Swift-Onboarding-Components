import Foundation

let DOB_MIN_AGE = 18
let DOB_MAX_AGE = 120

func isValidDate(_ date: String) -> Bool {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "yyyy-MM-dd"
    return dateFormatter.date(from: date) != nil
}

func isDobTooYoung(_ date: String, today: Date = Date()) -> Bool {
    guard let dob = DateFormatter().date(from: date) else { return false }
    let age = Calendar.current.dateComponents([.year], from: dob, to: today).year ?? 0
    return age < DOB_MIN_AGE
}

func isDobTooOld(_ date: String, today: Date = Date()) -> Bool {
    guard let dob = DateFormatter().date(from: date) else { return false }
    let age = Calendar.current.dateComponents([.year], from: dob, to: today).year ?? 0
    return age > DOB_MAX_AGE
}

func isDobInTheFuture(_ date: String, today: Date = Date()) -> Bool {
    guard let dob = DateFormatter().date(from: date) else { return false }
    return dob >= today
}

func isDob(_ dob: String, today: Date = Date()) -> Bool {
    return isValidDate(dob) && !isDobInTheFuture(dob, today: today) && !isDobTooYoung(dob, today: today) && !isDobTooOld(dob, today: today)
}
