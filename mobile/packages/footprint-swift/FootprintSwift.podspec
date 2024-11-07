Pod::Spec.new do |s|
    s.name             = 'FootprintSwift'
    s.version          = '2.1.4-alpha'
    s.summary          = 'FootprintSwift SDK for iOS'
    s.description      = <<-DESC
    Footprint-powered onboarding flows to your application
                         DESC
    s.homepage         = 'https://docs.onefootprint.com/articles/sdks/swift'
    s.license          = { :type => 'MIT', :file => 'LICENSE' }
    s.author           = { 'Rodrigo Pagnuzzi' => 'rodrigo@onefootprint.com' }
    s.source           = { :git => 'https://github.com/onefootprint/footprint-swift.git', :tag => s.version.to_s }
    
    s.ios.deployment_target = '14.0'
    s.swift_version = '5.9'
    
     # Subspec for Hosted
    s.subspec 'Hosted' do |a|
        a.source_files = 'Sources/FootprintSwift/Hosted/**/*.{swift}', 'Sources/FootprintSwift/Shared/**/*.{swift}'
    end

    # Subspec for OnboardingComponents
    s.subspec 'OnboardingComponents' do |b|
        b.source_files = 'Sources/FootprintSwift/**/*.{swift}'
    end
    
     
  end
