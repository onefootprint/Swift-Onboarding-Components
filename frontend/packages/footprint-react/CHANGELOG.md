# @onefootprint/footprint-react

## 7.7.1

### Patch Changes

- cd48cfd7d8: Fix validation token creation

## 7.7.0

### Minor Changes

- ec75c90fac: Bug fixes

## 7.6.0

### Minor Changes

- 8dcf41dbcf: Add is ready

## 7.5.0

### Minor Changes

- 04daf567e5: Add get requirements

### Patch Changes

- Updated dependencies [85ef45ebcd]
  - @onefootprint/footprint-js@3.15.2

## 7.3.0

### Minor Changes

- 71bd19260c: Introduce types for investor questions

## 7.2.0

### Minor Changes

- 93273e2f20: Fix relay to components

### Patch Changes

- Updated dependencies [93273e2f20]
  - @onefootprint/footprint-js@3.15.0

## 7.1.0

### Patch Changes

- Updated dependencies [b53be4d15d]
  - @onefootprint/footprint-js@3.14.0

## 7.0.0

### Patch Changes

- Updated dependencies [7012d9e9da]
  - @onefootprint/footprint-js@3.13.0

## 7.0.0-beta.0

### Patch Changes

- Updated dependencies [5061ff38fc]
  - @onefootprint/footprint-js@3.11.0

## 6.4.0

### Minor Changes

- 77a2c7e4d: Add appearance container width prop

### Patch Changes

- Updated dependencies [77a2c7e4d]
  - @onefootprint/footprint-js@3.10.0

## 6.3.0

### Minor Changes

- c2ec96d12: add FootprintButton and type definition

### Patch Changes

- Updated dependencies [c2ec96d12]
  - @onefootprint/footprint-js@3.9.1

## 6.2.1

### Minor Changes

- a2434a483: Add auth update flow support

### Patch Changes

- Updated dependencies [a2434a483]
  - @onefootprint/footprint-js@3.9.0

## 6.1.1

### Patch Changes

- a14729deb: Add foreign language support and bug fixes
- Updated dependencies [a14729deb]
  - @onefootprint/footprint-js@3.8.3

## 6.1.0

### Minor Changes

- 2fb5fe8d5: Add authToken for verify components & update userData keys for citizenship/nationality fields in verify

### Patch Changes

- Updated dependencies [2fb5fe8d5]
  - @onefootprint/footprint-js@3.7.0

## 6.0.0

### Minor Changes

- b9915eff4: Form component updates: async save ref method & removed type prop

### Patch Changes

- 933980417: Add l10n support
- Updated dependencies [933980417]
- Updated dependencies [b9915eff4]
  - @onefootprint/footprint-js@3.6.0

## 5.4.0

### Patch Changes

- Updated dependencies [57d333e1b]
  - @onefootprint/footprint-js@3.3.0

## 5.3.0

### Minor Changes

- 5c53277f6: Container customization

## 5.1.2

### Patch Changes

- a55834376: Patch validationToken argument not getting passed into onComplete and fix errors for vanilla integration callbacks for verify-button components
- Updated dependencies [a55834376]
  - @onefootprint/footprint-js@3.1.2

## 5.1.1

### Patch Changes

- d8738a9ad: Update component inline styles
- Updated dependencies [d8738a9ad]
  - @onefootprint/footprint-js@3.1.1

## 5.1.0

### Minor Changes

- cb96a1570: Added a getRef prop to get the ref from embedded forms that you can call save function on

### Patch Changes

- Updated dependencies [cb96a1570]
  - @onefootprint/footprint-js@3.1.0

## 5.0.0

### Major Changes

- 467956004: Updated interfaces to support our full component library

### Patch Changes

- Updated dependencies [467956004]
  - @onefootprint/footprint-js@3.0.0

## 4.2.0

### Patch Changes

- 79d29121c: Add component variant
- Updated dependencies [79d29121c]
  - @onefootprint/footprint-js@2.3.0

## 4.1.0

### Patch Changes

- Updated dependencies [a8c205031]
  - @onefootprint/footprint-js@2.2.0

## 4.0.1

### Patch Changes

- 3286077c3: Update peer dependencies

## 4.0.0

### Minor Changes

- ed624e1e6: ### Options

  We’re making the very last completion screen of the onboarding flow optional. By default, it will not show but if you want, you can enable it by adding it to an `options` object and pass it into your integration.

  ```js
  footprint.open({
    // your current integration configuration goes here
    options: {
      showCompletionPage: true,
    },
  });
  ```

  For more details, check out our [docs page article](https://docs.onefootprint.com/articles/integrate/customization#customizing-the-user-flow).

  ### Bootstrap

  Our integration now supports bootstrapping nationality data for users.

  You can now pass an `id.nationality` field with a 2-digit country code into the userData object, as below:

  ```js
  const userData = {
    "id.email": "jane.doe@acme.com",
    "id.phone_number": "+12025550179",
    //...and so on for the rest of the data.
    "id.nationality": "US",
  };
  ```

  For more details, check out our [docs page article](https://docs.onefootprint.com/articles/integrate/user-data#bootstrap-user-data)

### Patch Changes

- Updated dependencies [ed624e1e6]
  - @onefootprint/footprint-js@2.1.0

## 3.0.0

### Major Changes

- 6cf465ee6: ## 📢 Ahoy there fellow Footprinters!

  We've been tinkering in our digital workshop and are now ready to lift the curtain on some awesome updates we've made to our @onefootprint/footprint-js package! 🚀

  ### Extended User Data 📝

  Remember those days when we just supported email and phone_number? Those were some good times, weren't they? Well, brace yourselves because we've just stepped up our game! We now accept a whole trove of user data to kickstart the KYC journey. Here's a sneak peek into what you can include:

  - `id.first_name`
  - `id.last_name`
  - `id.dob`
  - `id.ssn9`
  - `id.ssn4`
  - `id.address_line1`
  - `id.address_line2`
  - `id.city`
  - `id.state`
  - `id.country`
  - `id.zip`

  That's right! We've expanded our footprint (see what we did there? 😉) to make sure you get more out of our nifty onboarding flow.

  ### Namespaced User Data 🎩

  We're also introducing a neat little prefix 'id.' for your user data keys. This helps keep everything organized and structured. You know, like a well-organized sock drawer. 🧦

  Here's an example of how it looks:

  ```js
  const userData = {
    'id.email': 'jane.doe@acme.com',
    'id.phone_number': '+12025550179',
    //...and so on for the rest of the data.
  };

  Now, before you panic about reworking your current implementation, put your coding fingers at ease! 🖖 The new prefix is totally optional and our API remains backward compatible. We're still buddies with your old data format, and we're not ready to break up just yet.

  For a more in-depth explanation, don't forget to check our [documentation](https://docs.onefootprint.com/articles/integrate/user-data).📚

  That's all folks! We can't wait for you to try out these updates and enjoy the enhanced KYC experience with @onefootprint/footprint-js. As always, thank you for being a part of our journey. 🌍

  Happy coding! 🚀👩‍💻👨‍💻
  ```

### Patch Changes

- Updated dependencies [aa7f3ea7c]
- Updated dependencies [6cf465ee6]
  - @onefootprint/footprint-js@2.0.0

## 2.0.1

### Patch Changes

- 96b18cc3: Fix race conditions when sending user data as option
- Updated dependencies [96b18cc3]
  - @onefootprint/footprint-js@1.0.2

## 2.0.0

### Patch Changes

- Updated dependencies [a63df443]
  - @onefootprint/footprint-js@1.0.0

## 1.0.1

### Patch Changes

- Updated dependencies [4b7452e6]
  - @onefootprint/footprint-js@0.6.0

## 1.0.0

### Patch Changes

- Updated dependencies [99fcb4ad]
  - @onefootprint/footprint-js@0.1.0
