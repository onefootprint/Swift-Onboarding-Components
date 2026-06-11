Pod::Spec.new do |s|
    s.name             = 'FootprintOnboardingComponents'
    # Do not change this line as it is automatically updated by the GitHub action
    s.version          = '1.5.6'
    s.summary          = 'A package for Swift onboarding components.'
    s.description      = <<-DESC
    Footprint-powered onboarding flows to your application
                         DESC
    s.homepage         = 'https://docs.onefootprint.com/articles/sdks/swift-introduction'
    s.license          = { :type => 'MIT', :file => 'LICENSE' }
    s.author           = { 'Rodrigo Pagnuzzi' => 'rodrigo@onefootprint.com' }
    s.source           = { :git => 'https://github.com/onefootprint/Swift-Onboarding-Components.git', :tag => s.version.to_s }
    s.module_name      = 'Footprint'
    s.ios.deployment_target = '14.0'
    s.swift_version = '5.9'

    # Add remote binary URL
    s.prepare_command = <<-CMD
        set -e
        rm -rf ./SwiftOnboardingComponentsShared.xcframework
        curl -L https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/#{s.version}/SwiftOnboardingComponentsShared.xcframework.zip -o SwiftOnboardingComponentsShared.xcframework.zip
        unzip -o SwiftOnboardingComponentsShared.xcframework.zip
        rm -f SwiftOnboardingComponentsShared.xcframework.zip
    CMD

    # CocoaPods compiles every subspec into the single `Footprint` module, so the
    # `package` access level used to share plumbing between the core and bank-linking
    # sources needs an explicit package name (SwiftPM sets this automatically).
    s.pod_target_xcconfig = { 'OTHER_SWIFT_FLAGS' => '-package-name Footprint' }

    s.default_subspec = 'Core'

    # Core onboarding/KYC. Default install pulls in neither MoneyKit nor Plaid.
    s.subspec 'Core' do |core|
        core.source_files = 'Sources/Footprint/**/*'
        core.vendored_frameworks = 'SwiftOnboardingComponentsShared.xcframework'
        core.dependency 'FingerprintPro', '~> 2.10'
    end

    # Opt-in bank account linking. Adds MoneyKit; only pulled in when a consumer
    # depends on 'FootprintOnboardingComponents/BankLinking'.
    s.subspec 'BankLinking' do |bal|
        bal.source_files = 'Sources/FootprintBankLinking/**/*'
        bal.dependency 'FootprintOnboardingComponents/Core'
        bal.dependency 'MoneyKit', '1.11.2'
    end
end
