require "json"

Pod::Spec.new do |s|
  s.name         = "footprint-ios"
  s.module_name  = "footprint-ios"
  s.version      = "1.0.0"
  s.summary      = "Footprint SDK for iOS"
  s.license      = "MIT"

  s.author       = "Footprint"
  s.homepage     = "https://onefootprint.com"

  s.vendored_frameworks = "Frameworks/*"
  s.resource_bundles = {
    package['name'] => ["Resources/*"],
  }

  s.library = 'c++'
  s.xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++11',
    'CLANG_CXX_LIBRARY' => 'libc++'
  }
end