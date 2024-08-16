# @onefootprint/footprint

## 3.12.2

### Patch Changes

- b42f3e862c: Use correct url for update auth methods

## 3.12.1

### Patch Changes

- e0efa2d3dc: Make business owners properties optional
  Change ownership_stake from string to number

## 3.12.0

### Minor Changes

- 03f0cf4ca3: Add bootstrapData for user and business properties

## 3.11.0

### Minor Changes

- 5061ff38fc: Preparation for ob components

## 3.10.0

### Minor Changes

- 77a2c7e4d: Add appearance container width prop

## 3.9.1

### Patch Changes

- c2ec96d12: add FootprintButton and type definition

## 3.9.0

### Minor Changes

- a2434a483: Add auth update flow support

## 3.8.3

### Patch Changes

- a14729deb: Add foreign language support and bug fixes

## 3.8.2

### Patch Changes

- 48c47f244: Add hideCancelButton to form component options prop

## 3.8.1

### Patch Changes

- ec3cf10a8: Reject form save with an error string when failed

## 3.8.0

### Minor Changes

- 4b9876ad1: Migrate to saving SDK args to API instead of post messages

## 3.7.1

### Patch Changes

- 4fa99dc2c: Fix dependencies

## 3.7.0

### Minor Changes

- 2fb5fe8d5: Add authToken for verify components & update userData keys for citizenship/nationality fields in verify

## 3.6.0

### Minor Changes

- 933980417: Add l10n support
- b9915eff4: Form component updates: async save ref method & removed type prop

## 3.5.0

### Minor Changes

- 5249e151d: Added locale to component interfaces

## 3.4.0

### Minor Changes

- 775935375: Add support for bootstrapping middle name data

## 3.3.0

### Minor Changes

- 57d333e1b: Add documentation for bootstrapping legal status data

## 3.2.0

### Minor Changes

- 5c53277f6: Container customization

## 3.1.2

### Patch Changes

- a55834376: Patch validationToken argument not getting passed into onComplete and fix errors for vanilla integration callbacks for verify-button components

## 3.1.1

### Patch Changes

- d8738a9ad: Update component inline styles

## 3.1.0

### Minor Changes

- cb96a1570: Added a getRef prop to get the ref from embedded forms that you can call save function on

## 3.0.0

### Major Changes

- 467956004: Updated interfaces to support our full component library

## 2.3.0

### Minor Changes

- 79d29121c: Add component variant

## 2.2.0

### Minor Changes

- a8c205031: Add option to show customer logo at the start of the flow

## 2.1.1

### Patch Changes

- 67901cd4a: Add new customization options: radio select

## 2.1.0

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

## 2.0.1

### Minor Changes

- fa27c0bd7: Fix a bug where users using Chrome browser couldn't log in using passkeys

## 2.0.0

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

### Minor Changes

- aa7f3ea7c: Allow customizing the app container

## 1.0.2

### Patch Changes

- 96b18cc3: Fix race conditions when sending user data as option

## 1.0.1

### Patch Changes

- 3384653b: Prevent to display more than one modal

## 1.0.0

### Major Changes

- a63df443: Rename show method to open. Allow to pass user data as parameter

## 0.6.1

### Patch Changes

- 0a9b10d5: Fix a bug where footprint couldn't open after closing the iframe

## 0.6.0

### Minor Changes

- 4b7452e6: Expose createButton function, so you can render the Footprint Button easily

## 0.5.0

### Minor Changes

- eba9e81e: Update dependencies

## 0.1.0

### Minor Changes

- 99fcb4ad: Add support to customize the appearance

## 0.3.0

### Minor Changes

- 9e53f207: Fix font styles

## 0.2.0

### Minor Changes

- 36033ecc: Support for modules

## 0.1.0

### Minor Changes

- 2f5d5870: Fix build

## 0.0.2

### Patch Changes

- 24e078ac: Fix build

## 0.0.1

### Patch Changes

- ab406e9f: First version
