use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IntegrityVerdict {
    pub request_details: RequestDetails,
    pub app_integrity: AppIntegrity,
    pub device_integrity: DeviceIntegrity,
    pub account_details: AccountDetails,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestDetails {
    pub request_package_name: String,
    pub timestamp_millis: String,
    pub nonce: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppIntegrity {
    pub app_recognition_verdict: AppRecognitionVerdict,
    pub package_name: Option<String>,
    pub certificate_sha256_digest: Option<Vec<String>>,
    pub version_code: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]

pub enum AppRecognitionVerdict {
    /// The app and certificate match the versions distributed by Google Play.
    PlayRecognized,
    /// The certificate or package name does not match Google Play records
    UnrecognizedVersion,
    /// Application integrity was not evaluated. A necessary requirement was missed, such as the
    /// device not being trustworthy enough
    Unevaluated,
    #[serde(other)]
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceIntegrity {
    #[serde(default)]
    pub device_recognition_verdict: Vec<DeviceRecognitionVerdict>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Hash, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]

pub enum DeviceRecognitionVerdict {
    /// The app is running on an Android device powered by Google Play services. The device passes
    /// system integrity checks and meets Android compatibility requirements.
    MeetsDeviceIntegrity,
    /// The app is running on a device that passes basic system integrity checks. The device may not
    /// meet Android compatibility requirements and may not be approved to run Google Play services.
    /// For example, the device may be running an unrecognized version of Android, may have an
    /// unlocked bootloader, or may not have been certified by the manufacturer.
    MeetsBasicIntegrity,
    /// The app is running on an Android device powered by Google Play services and has a strong
    /// guarantee of system integrity such as a hardware-backed proof of boot integrity. The device
    /// passes system integrity checks and meets Android compatibility requirements.
    MeetsStrongIntegrity,
    #[serde(other)]
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountDetails {
    pub app_licensing_verdict: AppLicensingVerdict,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]

pub enum AppLicensingVerdict {
    /// The user has an app entitlement. In other words, the user installed or bought your app on
    /// Google Play
    Licensed,
    /// The user doesn't have an app entitlement. This happens when, for example, the user sideloads
    /// your app or doesn't acquire it from Google Play
    Unlicensed,
    /// Licensing details were not evaluated because a necessary requirement was missed.
    /// This could happen for several reasons, including the following:
    /// - The device is not trustworthy enough.
    /// - The version of your app installed on the device is unknown to Google Play.
    /// - The user is not signed in to Google Play.
    Unevaluated,
    #[serde(other)]
    Unknown,
}
