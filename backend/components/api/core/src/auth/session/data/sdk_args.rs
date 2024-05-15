use db::{
    models::{
        appearance::Appearance, ob_configuration::ObConfiguration, tenant::Tenant,
        tenant_client_config::TenantClientConfig,
    },
    PgConn,
};
use newtypes::{
    DataIdentifier, EncryptedVaultPrivateKey, ObConfigurationKey, PiiJsonValue, PiiString, SealedVaultBytes,
    SessionAuthToken,
};
use paperclip::actix::Apiv2Schema;
use std::collections::HashMap;
use strum_macros::{Display, EnumDiscriminants};

use crate::errors::{ApiResult, ValidationError};

pub type UserDataV1 = HashMap<DataIdentifier, PiiJsonValue>;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone, Apiv2Schema)]
pub struct L10nV1 {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub locale: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub language: Option<String>,
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
    pub public_key: Option<ObConfigurationKey>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_data: Option<UserDataV1>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<VerifyV1Options>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub l10n: Option<L10nV1>,
    #[serde(skip_serializing_if = "Option::is_none")]
    /// The components SDK wraps the verify SDK with the same args
    pub is_components_sdk: Option<bool>,
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
    pub public_key: Option<ObConfigurationKey>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_data: Option<UserDataV1>,
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
    pub id: DataIdentifier,
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
    fn validate(&self) -> ApiResult<()>;

    /// If pertinent, the ob config identified by these SDK args
    fn ob_config(&self, _conn: &mut PgConn) -> ApiResult<Option<ObConfigInfo>> {
        Ok(None)
    }
}

impl ValidateSdkArgs for VerifyV1SdkArgs {
    fn validate(&self) -> ApiResult<()> {
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
            return Err(ValidationError("Either auth token or public key must be provided").into());
        }

        let show_completion_page = self
            .options
            .as_ref()
            .and_then(|s| s.show_completion_page)
            .unwrap_or_default();
        tracing::info!(%show_completion_page, "SDK args completion page option");
        Ok(())
    }

    fn ob_config(&self, conn: &mut PgConn) -> ApiResult<Option<ObConfigInfo>> {
        let obc = if let Some(key) = self.public_key.as_ref() {
            let (obc, tenant) = ObConfiguration::get_enabled(conn, key)?;
            let appearance = if let Some(appearance_id) = obc.appearance_id.as_ref() {
                Some(Appearance::get(conn, appearance_id, &tenant.id)?)
            } else {
                None
            };
            let client_config = TenantClientConfig::get(conn, &tenant.id, obc.is_live)?;
            Some((obc, tenant, client_config, appearance))
        } else {
            None
        };
        Ok(obc)
    }
}

impl ValidateSdkArgs for AuthV1SdkArgs {
    fn validate(&self) -> ApiResult<()> {
        let public_key = self
            .public_key
            .as_ref()
            .map(|pk| pk.to_string())
            .unwrap_or("None".into());
        tracing::info!(%public_key, "Auth args");
        if self.public_key.is_none() {
            return Err(ValidationError("Public key must be provided").into());
        }
        Ok(())
    }

    fn ob_config(&self, conn: &mut PgConn) -> ApiResult<Option<ObConfigInfo>> {
        let obc = if let Some(key) = self.public_key.as_ref() {
            let (obc, tenant) = ObConfiguration::get_enabled(conn, key)?;
            let appearance = if let Some(appearance_id) = obc.appearance_id.as_ref() {
                Some(Appearance::get(conn, appearance_id, &tenant.id)?)
            } else {
                None
            };
            let client_config = TenantClientConfig::get(conn, &tenant.id, obc.is_live)?;
            Some((obc, tenant, client_config, appearance))
        } else {
            None
        };
        Ok(obc)
    }
}

impl ValidateSdkArgs for UpdateAuthMethodsV1SdkArgs {
    fn validate(&self) -> ApiResult<()> {
        Ok(())
    }
}

impl ValidateSdkArgs for FormV1SdkArgs {
    fn validate(&self) -> ApiResult<()> {
        let auth_token_hash = self
            .auth_token
            .as_ref()
            .map(|t| SessionAuthToken::from(t).id().to_string())
            .unwrap_or("None".into());
        tracing::info!(%auth_token_hash, "Auth args");
        if self.auth_token.is_none() {
            return Err(ValidationError("Auth token must be provided").into());
        }
        Ok(())
    }
}

impl ValidateSdkArgs for RenderV1SdkArgs {
    fn validate(&self) -> ApiResult<()> {
        Ok(())
    }
}

impl ValidateSdkArgs for VerifyResultV1SdkArgs {
    fn validate(&self) -> ApiResult<()> {
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
    fn validate(&self) -> ApiResult<()> {
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

    fn ob_config(&self, conn: &mut PgConn) -> ApiResult<Option<ObConfigInfo>> {
        match self {
            Self::VerifyV1(args) => args.ob_config(conn),
            Self::VerifyResultV1(args) => args.ob_config(conn),
            Self::FormV1(args) => args.ob_config(conn),
            Self::AuthV1(args) => args.ob_config(conn),
            Self::UpdateAuthMethodsV1(args) => args.ob_config(conn),
            Self::RenderV1(args) => args.ob_config(conn),
        }
    }
}

#[cfg(test)]
mod test {
    use serde_json::json;
    use test_case::test_case;

    use crate::auth::session::sdk_args::ValidateSdkArgs;

    use super::SdkArgs;

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
