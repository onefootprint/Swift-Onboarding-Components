---
'@onefootprint/footprint-js': major
'@onefootprint/footprint-react': major
---

## 📢 Ahoy there fellow Footprinters!

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

For a more in-depth explanation, don't forget to check our [documentation](https://docs.onefootprint.com/integrate/user-data).📚

That's all folks! We can't wait for you to try out these updates and enjoy the enhanced KYC experience with @onefootprint/footprint-js. As always, thank you for being a part of our journey. 🌍

Happy coding! 🚀👩‍💻👨‍💻