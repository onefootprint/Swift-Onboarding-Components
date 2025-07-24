import FingerprintPro

func getFingerprintCredentials(apiKey: String) async throws -> (visitorId: String, requestId: String) {
    let configuration = Configuration(apiKey: apiKey)
    let client = FingerprintProFactory.getInstance(configuration)
    
    let visitorIdResponse = try await client.getVisitorIdResponse()
    return (visitorIdResponse.visitorId, visitorIdResponse.requestId)
}
