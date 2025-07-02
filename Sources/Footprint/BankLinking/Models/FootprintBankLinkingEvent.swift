public struct FootprintBankLinkingEvent {
    public let name: String
    public let properties: [String: Any]
    public let meta: [String: Any]

    public init(name: String, properties: [String: Any], meta: [String: Any]) {
        var filteredMeta = meta
        filteredMeta.removeValue(forKey: "link_session_id")
        self.name = name
        self.properties = properties
        self.meta = filteredMeta
    }
}
