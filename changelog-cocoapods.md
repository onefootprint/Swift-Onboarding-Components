### Changelog for FootprintOnboardingComponents CocoaPod

# 2.1.0
- Added a single `initialize(authToken:)`; `initializeWithAuthToken` / `initializeWithPublicKey` are deprecated (still functional this version; public-key init is removed next major).
- Added `collect_custom_data` support. Native document capture is available via Swift Package Manager (the `FootprintDocumentCapture` product); CocoaPods support to follow. See the [native onboarding docs](https://docs.onefootprint.com/articles/sdks/swift-native).

# 2.0.0
  Bank linking is now a separate, opt-in subspec, and the unused Plaid dependency has been removed.

  - **Removed the Plaid dependency.** Removed the Plaid dependency. (Note: Plaid drops CocoaPods support after 6.4.7 their release).
  - **Bank linking moved to the `BankLinking` subspec.** The default `pod 'FootprintOnboardingComponents'` no longer includes bank linking or MoneyKit. If you use bank linking, depend on `pod 'FootprintOnboardingComponents/BankLinking'` instead. Your imports do not change — everything is still the `Footprint` module.
  - **Onboarding-only consumers:** no changes required, and your app no longer links MoneyKit or Plaid.

# 1.5.6
Add internal baseUrl overrides for automated testing to enhance stability of releases. No changes required on the client side.

# 1.5.5
Add internal tracking for SDK version to we can upgrade clients when their version is outdated. No changes required on the client side.

# 1.5.4
Sync cocoapods package with SPM package and use the same version.
- `FootprintHosted.shared.launchHosted` doesn't accept `bootstrapData` prop anymore. If you were using the `bootstrapData` prop, use the endpoint `POST https://api.onefootprint.com/onboarding/session` to bootstrap data ahead of time, create an onboarding session token and use the token for `authToken` prop.
- `FootprintHosted.shared.launchHosted` doesn't require calling `Footprint.shared.initializeWithPublicKey` anymore
- You can now use our new `Onboarding.shared.initialize` function, check our docs for implementation details
