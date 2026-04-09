### Changelog for FootprintOnboardingComponents CocoaPod

# 1.5.4
Sync cocoapods package with SPM package and use the same version.
- `FootprintHosted.shared.launchHosted` doesn't accept `bootstrapData` prop anymore. If you were using the `bootstrapData` prop, use the endpoint `POST https://api.onefootprint.com/onboarding/session` to bootstrap data ahead of time, create an onboarding session token and use the token for `authToken` prop.
- `FootprintHosted.shared.launchHosted` doesn't require calling `Footprint.shared.initializeWithPublicKey` anymore
- You can now use our new `Onboarding.shared.initialize` function, check our docs for implementation details
