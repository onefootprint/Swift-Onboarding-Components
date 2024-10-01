## 1.0.0

- Initial version

## 1.0.1

- New bootstrap data fields

## 1.0.2

- Remove theme variable from appearance
- Fix a bug that prevented the users to initialize the flow with auth token

## 2.0.0-beta

- Introduction of onboarding components

## 2.0.0-beta.2

- Introduction of inline OTP in onboarding components

## 2.0.0-beta.3

- Introduction of auth playbook support
- `isReadyForAuth` has been removed, instead we introduced a global `isReady` variable. Please make sure that `isReady = true` before you use other functionalities provided by the SDK.
- `save()` function has been renamed to `vault()`.
- `FootprintForm` takes `DataIdentifier` enum values as `name` field now instead of taking a `string` . This is to ensure that you don’t mistakenly pass a wrong string.
- The return type of `requiresAuth()` function has been updated to return helpful information such as already vaulted data, requirements, etc.
- `getRequirements()` is a new helper function that lets to get the requirements at any point during the flow.
- We provide an inline `process()` function to complete the flow inline if you aren’t collecting docs and passkeys.

## 2.0.0-beta.3.1

Late initialization bug fix
