### Changelog for Swift onboarding components SDK
*Updating this file is one of the requirements for GitHub CI/CD for Swift package release*

 # 2.1.0
- Added a single `initialize(authToken:)`; `initializeWithAuthToken` / `initializeWithPublicKey` are deprecated (still functional this version; public-key init is removed next major).
- Added the opt-in `FootprintDocumentCapture` product for native document capture, and `collect_custom_data` support. See the [native onboarding docs](https://docs.onefootprint.com/articles/sdks/swift-native).

 # 2.0.0
  Bank linking is now a separate, opt-in product, and the previous Plaid dependency has been removed.

  - **Removed the Plaid (LinkKit) dependency.** Removed the Plaid dependency.
  - **Bank linking moved to a new `FootprintBankLinking` product.** If you use bank linking, you must:
    1. Add the `FootprintBankLinking` library product to your target (alongside `Footprint`).
    2. Add `import FootprintBankLinking` to any file that uses `FootprintBankLinking`, `BankLinkingCompletionResponse`, or the other bank-linking types.
  - **Onboarding-only consumers:** no changes required. The core `Footprint` product no longer links MoneyKit or Plaid, so your app gets a smaller binary.

# 1.5.6
Add internal baseUrl overrides for automated testing to enhance stability of releases. No changes required on the client side.

# 1.5.5
Add internal tracking for SDK version to we can upgrade clients when their version is outdated. No changes required on the client side.

# 1.5.4
Upgrade MKit to v1.11.2. No changes needed on client side other than upgrading.

# 1.5.3
Lock internal dep MKit to v1.10.7. because the new version they released breaks the integration. No changes needed on client side other than upgrading.

# 1.5.2
Fix double sheet problem in BAL

# 1.5.1
Internal API fix

# 1.5.0
Update BAL interface

# 1.4.1
Upgrade to MK 1.10.4

# 1.4.0
Previous 1.3.9 got corrupt because MK didn't provide stable version. Releasing with stable MK 1.10.3

# 1.3.9
Use MK branch "release/1.10.3"

# v1.3.8
BAL thread callback issue fixed in new MoneyKit release

# v1.3.7
Internal API updates

# v1.3.4
Add SDK version to the URL, remove sandbox outcome and options props from `Onboarding.shared.initialize()`

# v1.3.3
Add Kosovo to supported countries for doc collection

# v1.3.2
Update api types

# v1.3.1
Update prop name in Onboarding.shared.initialize

# v1.3.0
Onboarding in background

# v1.2.1
Patch: make the success meta fields public BAL

# v1.2.0
Added additional metadata in onSuccess callback for bank linking

# v1.1.1
Add support for onEvent callback in bank linking

# v1.1.0
Add custom fields support

# v1.0.3
Add better support appearance and bootstrap data in hosted flow (launchHosted function)

# v1.0.2
Update APIs for OBE support

# v1.0.1
Patch Bank linking to return validation token onSuccess

# v1.0.0
Publish a new stable version

# v1.0.3-beta
Publish Footprint Bank Linking

# v1.0.2-beta
Bump some dependencies version

# v1.0.1-beta
Add fingerprint integration

# v1.0.0-beta
Initial beta release

# v1.0.0-alpha
Initial alpha release

# v0.2.43
Initial test release
