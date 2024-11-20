# Footprint Flutter

## Package oveview

Flutter is a powerful open-source framework to develop cross-platform applications from a single codebase. The Flutter plugin allows you to integrate Footprint onboarding flow into your Flutter Android/iOS apps. The plugin utilizes a secure in-app browser to run the onboarding flow.

## Installation

From the terminal, run the following command:

```bash
flutter pub add footprint_flutter
```

This will add the `footprint_flutter` dependency to your project’s `pubspec.yaml` as follows:

```yaml
dependencies:
  footprint_flutter: ^2.0.0-beta.3.2
```

Alternatively, you can manually edit the `pubspec.yaml` file to add the dependency and run `flutter pub get` from the terminal to install the dependency.

After the installation, you need to link the InAppBrowser dependency. For iOS, make sure to run:

```bash
cd ios && pod install && cd ..
```

**To use onboarding components, please install version 2.0.0-beta.3.1**

## Hosted flow

Hosted flow docs can be found [here](https://docs.onefootprint.com/articles/sdks/flutter-hosted)

## Onboarding components

Onboarding components docs can be found [here](https://docs.onefootprint.com/articles/sdks/flutter-onboarding-components)
