---
'@onefootprint/footprint-js': minor
'@onefootprint/footprint-react': minor
---

### Options

We’re making the very last completion screen of the onboarding flow optional. By default, it will not show but if you want, you can enable it by adding it to an `options` object and pass it into your integration.

```js
footprint.open({
  // your current integration configuration goes here
  options: {
    showCompletionPage: true,
  },
});
```

For more details, check out our [docs page article](https://docs.onefootprint.com/integrate/customization#customizing-the-user-flow).

### Bootstrap

Our integration now supports bootstrapping nationality data for users.

You can now pass an `id.nationality` field with a 2-digit country code into the userData object, as below:

```js
const userData = {
  'id.email': 'jane.doe@acme.com',
  'id.phone_number': '+12025550179',
  //...and so on for the rest of the data.
  'id.nationality': 'US',
};
```

For more details, check out our [docs page article](https://docs.onefootprint.com/integrate/user-data#bootstrap-user-data)
