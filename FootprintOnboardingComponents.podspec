Pod::Spec.new do |s|
    s.name             = 'FootprintOnboardingComponents'
    # Do not change this line as it is automatically updated by the GitHub action
    s.version          = '1.5.4'
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
    s.source_files = 'Sources/**/*'

    # Add remote binary URL
    s.prepare_command = <<-CMD
        set -e
        rm -rf ./SwiftOnboardingComponentsShared.xcframework
        curl -L https://github.com/onefootprint/Swift-Onboarding-Components/releases/download/#{s.version}/SwiftOnboardingComponentsShared.xcframework.zip -o SwiftOnboardingComponentsShared.xcframework.zip
        unzip -o SwiftOnboardingComponentsShared.xcframework.zip
        rm -f SwiftOnboardingComponentsShared.xcframework.zip
    CMD

     # Define the binary framework
    s.vendored_frameworks = 'SwiftOnboardingComponentsShared.xcframework'
    
    # Dependencies
    s.dependency 'FingerprintPro', '~> 2.10'
    s.dependency 'MoneyKit', '1.11.2'
    s.dependency 'Plaid', '~> 6.4'
end
