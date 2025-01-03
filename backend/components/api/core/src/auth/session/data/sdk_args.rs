use crate::FpResult;
use api_errors::BadRequestInto;
use db::models::appearance::Appearance;
use db::models::ob_configuration::ObConfiguration;
use db::models::tenant::Tenant;
use db::models::tenant_client_config::TenantClientConfig;
use newtypes::impl_modern_map_apiv2_schema;
use newtypes::BootstrapKey;
use newtypes::DataIdentifier as DI;
use newtypes::DocumentFixtureResult;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use newtypes::PublishablePlaybookKey;
use newtypes::SandboxId;
use newtypes::SealedVaultBytes;
use newtypes::SessionAuthToken;
use newtypes::WorkflowFixtureResult;
use paperclip::actix::Apiv2Schema;
use std::collections::HashMap;
use strum_macros::Display;
use strum_macros::EnumDiscriminants;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Default)]
#[serde(transparent)]
pub struct BootstrapDataV1(pub HashMap<BootstrapKey, PiiJsonValue>);
impl_modern_map_apiv2_schema!(
    BootstrapDataV1,
    BootstrapKey,
    "Key-value map of bootstrap data. For more documentation on available keys, see [here](https://docs.onefootprint.com/articles/integrate/bootstrap-data#boostraping-kyb-data).",
    { "id.first_name": "Jane", "id.last_name": "Doe" }
);

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct L10nV1 {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub locale: Option<Locale>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub language: Option<Language>,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub enum Locale {
    #[serde(rename = "en-US")]
    EnUs,
    #[serde(rename = "es-MX")]
    EsMx,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum Language {
    En,
    Es,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct VerifyV1Options {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub show_completion_page: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub show_logo: Option<bool>,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct VerifyV1SdkArgs {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auth_token: Option<PiiString>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub public_key: Option<PublishablePlaybookKey>,
    #[serde(skip_serializing_if = "Option::is_none")]
    // TODO: ideally we rename this to bootstrap_data, but it's a breaking change to the client
    pub user_data: Option<BootstrapDataV1>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<VerifyV1Options>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub l10n: Option<L10nV1>,
    #[serde(skip_serializing_if = "Option::is_none")]
    /// The components SDK wraps the verify SDK with the same args
    pub is_components_sdk: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub should_relay_to_components: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fixture_result: Option<WorkflowFixtureResult>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub document_fixture_result: Option<DocumentFixtureResult>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sandbox_id: Option<SandboxId>,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct VerifyResultV1SdkArgs {
    pub auth_token: PiiString,
    pub device_response: String,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct AuthV1Options {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub show_logo: Option<bool>,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct AuthV1SdkArgs {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub public_key: Option<PublishablePlaybookKey>,
    #[serde(skip_serializing_if = "Option::is_none")]
    // TODO: ideally we rename this to bootstrap_data, but it's a breaking change to the client
    pub user_data: Option<BootstrapDataV1>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<AuthV1Options>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub l10n: Option<L10nV1>,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct UpdateAuthMethodsV1SdkArgs {
    pub auth_token: PiiString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<AuthV1Options>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub l10n: Option<L10nV1>,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct FormV1Options {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hide_buttons: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hide_cancel_button: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hide_footprint_logo: Option<bool>,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct FormV1SdkArgs {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auth_token: Option<PiiString>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<FormV1Options>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub l10n: Option<L10nV1>,
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct RenderV1SdkArgs {
    pub id: DI,
    pub auth_token: PiiString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub can_copy: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_hidden: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub show_hidden_toggle: Option<bool>,
}

pub type ObConfigInfo = (
    ObConfiguration,
    Tenant,
    Option<TenantClientConfig>,
    Option<Appearance>,
);

pub trait ValidateSdkArgs {
    /// Validate the contents of the SdkArgs
    fn validate(&self) -> FpResult<()>;
}

impl ValidateSdkArgs for VerifyV1SdkArgs {
    fn validate(&self) -> FpResult<()> {
        let auth_token_hash = self
            .auth_token
            .as_ref()
            .map(|t| SessionAuthToken::from(t).id().to_string())
            .unwrap_or("None".into());
        let public_key = self
            .public_key
            .as_ref()
            .map(|pk| pk.to_string())
            .unwrap_or("None".into());
        tracing::info!(%auth_token_hash, %public_key, "Verify args");
        if self.auth_token.is_none() && self.public_key.is_none() {
            return BadRequestInto("Either auth token or public key must be provided");
        }

        let show_completion_page = self
            .options
            .as_ref()
            .and_then(|s| s.show_completion_page)
            .unwrap_or_default();
        tracing::info!(%show_completion_page, "SDK args completion page option");
        Ok(())
    }
}

impl ValidateSdkArgs for AuthV1SdkArgs {
    fn validate(&self) -> FpResult<()> {
        let public_key = self
            .public_key
            .as_ref()
            .map(|pk| pk.to_string())
            .unwrap_or("None".into());
        tracing::info!(%public_key, "Auth args");
        if self.public_key.is_none() {
            return BadRequestInto("Public key must be provided");
        }
        Ok(())
    }
}

impl ValidateSdkArgs for UpdateAuthMethodsV1SdkArgs {
    fn validate(&self) -> FpResult<()> {
        Ok(())
    }
}

impl ValidateSdkArgs for FormV1SdkArgs {
    fn validate(&self) -> FpResult<()> {
        let auth_token_hash = self
            .auth_token
            .as_ref()
            .map(|t| SessionAuthToken::from(t).id().to_string())
            .unwrap_or("None".into());
        tracing::info!(%auth_token_hash, "Auth args");
        if self.auth_token.is_none() {
            return BadRequestInto("Auth token must be provided");
        }
        Ok(())
    }
}

impl ValidateSdkArgs for RenderV1SdkArgs {
    fn validate(&self) -> FpResult<()> {
        Ok(())
    }
}

impl ValidateSdkArgs for VerifyResultV1SdkArgs {
    fn validate(&self) -> FpResult<()> {
        Ok(())
    }
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema, EnumDiscriminants)]
#[strum_discriminants(name(SdkArgsKind))]
#[strum_discriminants(derive(Display))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
#[strum_discriminants(vis(pub))]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
/// BE VERY CAREFUL CHANGING THESE.
/// Old versions of Footprint.js may be sending old versions of this struct.
/// When making a breaking change to the struct, you should add a new version of the struct to this
/// enum variant.
pub enum SdkArgs {
    VerifyV1(VerifyV1SdkArgs),
    VerifyResultV1(VerifyResultV1SdkArgs),
    FormV1(FormV1SdkArgs),
    AuthV1(AuthV1SdkArgs),
    UpdateAuthMethodsV1(UpdateAuthMethodsV1SdkArgs),
    RenderV1(RenderV1SdkArgs),
}

/// This structure is stored encrypted inside the session table
#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct SdkArgsData {
    /// The private key encrypted to the enclave that can be used to decrypt the data
    pub e_private_key: EncryptedVaultPrivateKey,
    /// The encrypted token data
    pub e_data: SealedVaultBytes,
}

impl std::fmt::Debug for SdkArgsData {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "SdkArgsData<scrubbed>")
    }
}

impl ValidateSdkArgs for SdkArgs {
    fn validate(&self) -> FpResult<()> {
        match self {
            Self::VerifyV1(args) => args.validate()?,
            Self::VerifyResultV1(args) => args.validate()?,
            Self::FormV1(args) => args.validate()?,
            Self::AuthV1(args) => args.validate()?,
            Self::UpdateAuthMethodsV1(args) => args.validate()?,
            Self::RenderV1(args) => args.validate()?,
        }
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::SdkArgs;
    use crate::auth::session::sdk_args::ValidateSdkArgs;
    use serde_json::json;
    use test_case::test_case;

    #[test_case(json!({"kind": "verify_v1", "data": {"auth_token": "tok_1234", "public_key": "ob_1234", "user_data": {"id.first_name": "Hayes", "id.citizenships": ["US", "NO"], "id.state": "Invalid"}, "options": {"show_completion_page": true, "show_logo": false}, "l10n": {"locale": "en-US"}}}))]
    #[test_case(json!({"kind": "verify_v1", "data": {"auth_token": "tok_1234"}}))]
    #[test_case(json!({"kind": "verify_v1", "data": {"public_key": "ob_1234", "user_data": {"id.first_name": "Hayes"}, "options": {"show_logo": false}}}))]
    #[test_case(json!({"kind": "verify_v1", "data": {"public_key": "ob_1234", "is_components_sdk": false}}))]
    #[test_case(json!({"kind": "verify_v1", "data": {"public_key": "ob_1234", "is_components_sdk": true}}))]
    #[test_case(json!({"kind": "verify_result_v1", "data": {"auth_token": "tok_1234", "device_response": "123"}}))]
    #[test_case(json!({"kind": "form_v1", "data": {"auth_token": "tok_1234", "title": "My Form", "options": {"hide_buttons": true, "hide_footprint_logo": true}, "l10n": {"locale": "en-US"}}}))]
    #[test_case(json!({"kind": "form_v1", "data": {"auth_token": "tok_1234", "title": "My Form", "options": {"hide_buttons": true, "hide_footprint_logo": true}, "l10n": {"locale": "en-US", "language": "en"}}}))]
    #[test_case(json!({"kind": "form_v1", "data": {"auth_token": "tok_1234", "title": "My Form", "options": {"hide_buttons": true, "hide_footprint_logo": true}, "l10n": {"language": "es"}}}))]
    #[test_case(json!({"kind": "form_v1", "data": {"auth_token": "tok_1234", "title": "My Form", "options": {"hide_cancel_button": true, "hide_footprint_logo": true}, "l10n": {"locale": "en-US"}}}))]
    #[test_case(json!({"kind": "form_v1", "data": {"auth_token": "tok_1234"}}))]
    #[test_case(json!({"kind": "auth_v1", "data": {"public_key": "ob_1234", "options": {"show_logo": false}}}))]
    #[test_case(json!({"kind": "auth_v1", "data": {"public_key": "ob_1234", "user_data": {"id.first_name": "Hayes"}, "options": {"show_logo": false}}}))]
    #[test_case(json!({"kind": "auth_v1", "data": {"public_key": "ob_1234", "user_data": {"id.first_name": "Hayes"}}}))]
    #[test_case(json!({"kind": "auth_v1", "data": {"public_key": "ob_1234"}}))]
    #[test_case(json!({"kind": "update_auth_methods_v1", "data": {"auth_token": "tok_1234"}}))]
    #[test_case(json!({"kind": "update_auth_methods_v1", "data": {"auth_token": "tok_1234", "options": {"show_logo": false}}}))]
    #[test_case(json!({"kind": "render_v1", "data": {"auth_token": "tok_1234", "id": "id.email"}}))]
    #[test_case(json!({"kind": "render_v1", "data": {"auth_token": "tok_1234", "id": "id.phone_number", "label": "Phone"}}))]
    #[test_case(json!({"kind": "render_v1", "data": {"auth_token": "tok_1234", "id": "id.phone_number", "label": "Phone 2", "can_copy": true}}))]
    #[test_case(json!({"kind": "render_v1", "data": {"auth_token": "tok_1234", "id": "id.phone_number", "label": "Email", "can_copy": true, "default_hidden": true}}))]
    #[test_case(json!({"kind": "render_v1", "data": {"auth_token": "tok_1234", "id": "id.phone_number", "label": "Email", "can_copy": true, "default_hidden": true, "show_hidden_toggle": true}}))]
    fn test_backcompat(value: serde_json::Value) {
        let args: SdkArgs = serde_json::value::from_value(value.clone()).unwrap();
        args.validate().unwrap();
        let serialized_value = serde_json::value::to_value(args).unwrap();
        assert_eq!(value, serialized_value);
    }
}
