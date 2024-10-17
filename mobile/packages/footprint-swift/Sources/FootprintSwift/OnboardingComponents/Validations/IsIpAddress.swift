import Foundation

let iPv4SegmentFormat = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])"
let iPv4AddressFormat = "(\(iPv4SegmentFormat)[.]){3}\(iPv4SegmentFormat)"
let iPv4AddressRegex = try! NSRegularExpression(pattern: "^\(iPv4AddressFormat)$")

let iPv6SegmentFormat = "(?:[0-9a-fA-F]{1,4})"
let iPv6AddressRegex = try! NSRegularExpression(pattern: "^((?:\(iPv6SegmentFormat):){7}(?:\(iPv6SegmentFormat)|:)|(?:\(iPv6SegmentFormat):){6}(?:\(iPv4AddressFormat)|:\(iPv6SegmentFormat)|:)|(?:\(iPv6SegmentFormat):){5}(?::\(iPv4AddressFormat)|(::\(iPv6SegmentFormat)){1,2}|:)|(?:\(iPv6SegmentFormat):){4}(?:(::\(iPv6SegmentFormat)){0,1}:\(iPv4AddressFormat)|(::\(iPv6SegmentFormat)){1,3}|:)|(?:\(iPv6SegmentFormat):){3}(?:(::\(iPv6SegmentFormat)){0,2}:\(iPv4AddressFormat)|(::\(iPv6SegmentFormat)){1,4}|:)|(?:\(iPv6SegmentFormat):){2}(?:(::\(iPv6SegmentFormat)){0,3}:\(iPv4AddressFormat)|(::\(iPv6SegmentFormat)){1,5}|:)|(?:\(iPv6SegmentFormat):){1}(?:(::\(iPv6SegmentFormat)){0,4}:\(iPv4AddressFormat)|(::\(iPv6SegmentFormat)){1,6}|:)|(?::((?:::\(iPv6SegmentFormat)){0,5}:\(iPv4AddressFormat)|(?:::\(iPv6SegmentFormat)){1,7}|:)))(%[0-9a-zA-Z-.:]{1,})?$")

func isIP(_ str: String, version: String = "") -> Bool {
    if version.isEmpty {
        return isIP(str, version: "4") || isIP(str, version: "6")
    }
    if version == "4" {
        let range = NSRange(location: 0, length: str.utf16.count)
        return iPv4AddressRegex.firstMatch(in: str, options: [], range: range) != nil
    }
    if version == "6" {
        let range = NSRange(location: 0, length: str.utf16.count)
        return iPv6AddressRegex.firstMatch(in: str, options: [], range: range) != nil
    }
    return false
}
