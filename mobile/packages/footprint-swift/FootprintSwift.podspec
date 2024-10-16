Pod::Spec.new do |s|
    s.name             = 'FootprintSwift'
    s.version          = '2.0.2-alpha'
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
    
    s.source_files = 'Sources/FootprintSwift/**/*'
    
    s.test_spec 'Tests' do |test_spec|
      test_spec.source_files = 'Tests/FootprintSwiftTests/**/*'
    end
  end