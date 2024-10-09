import Foundation


public struct Verify {
    public var requirements: RequirementAttributes?
    public var validationToken: String
    public var vaultData: VaultData?
    
    public init(requirements:RequirementAttributes?, validationToken: String, vaultData: VaultData? ) {
        self.requirements = requirements
        self.validationToken = validationToken
        self.vaultData = vaultData
    }
}
