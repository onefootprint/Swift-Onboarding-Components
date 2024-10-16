//
// D2pSmsRequest.swift
//
// Generated by openapi-generator
// https://openapi-generator.tech
//

import Foundation

public struct D2pSmsRequest: Codable, JSONEncodable, Hashable {

    public var url: String

    public init(url: String) {
        self.url = url
    }

    public enum CodingKeys: String, CodingKey, CaseIterable {
        case url
    }

    // Encodable protocol methods

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(url, forKey: .url)
    }
}

