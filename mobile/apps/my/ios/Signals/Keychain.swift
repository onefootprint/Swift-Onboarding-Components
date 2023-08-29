//
//  Keychain.swift
//  my
//
//  Created by Alex Grinman on 7/30/23.
//
import Foundation

fileprivate let KeychainaAccessability = kSecAttrAccessibleWhenUnlocked
fileprivate let Service = "com.onefootprint.my"
fileprivate let AccessGroup = "5F264K8AG4.com.onefootprint.my"

class KeychainStorage {

    let synchronized: CFBoolean
    let accessability: CFString
    let accessGroup: String
    let isFullApp: Bool
    var service:String

    enum Errors:Error {
        case notFound
        case notAllowed
        case saveError(OSStatus?)
        case delete(OSStatus?)
        case unknown(OSStatus?)
    }

    private let appClipDisallowed:[String] = [String(kSecAttrAccessGroup), String(kSecAttrSynchronizable), String(kSecAttrAccessible)]

    var label: String {
        if !isFullApp {
            return "footprint-appclip"
        }

        return "footprint"
    }

    init(service:String = Service, synchronized: Bool = true, accessGroup: String = AccessGroup, accessability: CFString = KeychainaAccessability, appClipMode: Bool = false) {
        self.service = service
        self.synchronized = synchronized ? kCFBooleanTrue : kCFBooleanFalse
        self.accessGroup = accessGroup
        self.accessability = accessability
        self.isFullApp = appClipMode
    }

    func setData(key:String, data:Data) throws {
        var params: [String : Any] = [String(kSecClass): kSecClassGenericPassword,
                      String(kSecAttrService): service,
                      String(kSecAttrAccount): key,
                      String(kSecValueData): data,
                      String(kSecAttrLabel): label,
                      String(kSecAttrAccessGroup): accessGroup,
                      String(kSecAttrSynchronizable): synchronized,
                      String(kSecAttrAccessible): accessability]

        if !isFullApp {
            for p in appClipDisallowed { params.removeValue(forKey: p)}
        }

        let _ = SecItemDelete(params as CFDictionary)

        let status = SecItemAdd(params as CFDictionary, nil)
        if status == errSecInteractionNotAllowed {
            throw Errors.notAllowed
        }
        guard status.isSuccess() else {
            throw Errors.saveError(status)
        }

    }


    func getData(key:String) throws -> Data {
        var params:[String : Any] = [String(kSecClass): kSecClassGenericPassword,
                      String(kSecAttrService): service,
                      String(kSecAttrAccount): key,
                      String(kSecReturnData): kCFBooleanTrue as Any,
                      String(kSecMatchLimit): kSecMatchLimitOne,
                      String(kSecAttrLabel): label,
                      String(kSecAttrAccessGroup): accessGroup,
                      String(kSecAttrSynchronizable): synchronized,
                      String(kSecAttrAccessible): accessability]

        if !isFullApp {
            for p in appClipDisallowed { params.removeValue(forKey: p)}
        }

        var object:AnyObject?
        let status = SecItemCopyMatching(params as CFDictionary, &object)

        if status == errSecItemNotFound {
            throw Errors.notFound
        }
        if status == errSecInteractionNotAllowed {
            throw Errors.notAllowed
        }

        guard let data = object as? Data, status.isSuccess() else {
            throw Errors.unknown(status)
        }

        return data
    }

    func delete(key:String) throws {
        let params: [String : Any] = [String(kSecClass): kSecClassGenericPassword,
                      String(kSecAttrService): service,
                      String(kSecAttrAccessGroup): accessGroup,
                      String(kSecAttrAccount): key]

        let status = SecItemDelete(params as CFDictionary)

        guard status.isSuccess() else {
            throw Errors.delete(status)
        }
    }

    /// Workaround: test if the device has been "first unlocked"
    func isInteractionAllowed() -> Bool {
        do {
            try setData(key: "TestKey", data: Data())
        } catch Errors.notAllowed {
            return false
        } catch {}

        return true
    }

}

extension OSStatus {
    func isSuccess() -> Bool {
        return self == noErr || self == errSecSuccess
    }
}
