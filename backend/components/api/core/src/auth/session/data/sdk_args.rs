use db::{
    models::{
        appearance::Appearance, ob_configuration::ObConfiguration, tenant::Tenant,
        tenant_client_config::TenantClientConfig,
    },
    PgConn,
};
use newtypes::{
    DataIdentifier, EncryptedVaultPrivateKey, ObConfigurationKey, PiiJsonValue, PiiString, SealedVaultBytes,
};
use paperclip::actix::Apiv2Schema;
use std::collections::HashMap;
use strum_macros::{Display, EnumDiscriminants};

use crate::errors::{ApiResult, ValidationError};

pub type VerifyV1UserData = HashMap<DataIdentifier, PiiJsonValue>;

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
    pub user_data: Option<VerifyV1UserData>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<VerifyV1Options>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub locale: Option<String>,
}

impl VerifyV1SdkArgs {
    pub fn validate(&self) -> ApiResult<()> {
        if self.auth_token.is_none() && self.public_key.is_none() {
            return Err(ValidationError("Either auth token or public key must be provided").into());
        }
        Ok(())
    }

    pub fn ob_config(&self, conn: &mut PgConn) -> ApiResult<Option<ObConfigInfo>> {
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
}

/// This structure is stored encrypted inside the session table
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct SdkArgsData {
    /// The private key encrypted to the enclave that can be used to decrypt the data
    pub e_private_key: EncryptedVaultPrivateKey,
    /// The encrypted token data
    pub e_data: SealedVaultBytes,
}

pub type ObConfigInfo = (
    ObConfiguration,
    Tenant,
    Option<TenantClientConfig>,
    Option<Appearance>,
);

impl SdkArgs {
    pub fn validate(&self) -> ApiResult<()> {
        match self {
            Self::VerifyV1(args) => args.validate()?,
        }
        Ok(())
    }

    pub fn ob_config(&self, conn: &mut PgConn) -> ApiResult<Option<ObConfigInfo>> {
        match self {
            Self::VerifyV1(args) => args.ob_config(conn),
        }
    }
}

#[cfg(test)]
mod test {
    use serde_json::json;
    use test_case::test_case;

    use super::SdkArgs;

    #[test_case(json!({"kind": "verify_v1", "data": {"auth_token": "tok_1234", "public_key": "ob_1234", "user_data": {"id.first_name": "Hayes", "id.citizenships": ["US", "NO"], "id.state": "Invalid"}, "options": {"show_completion_page": true, "show_logo": false}, "locale": "en-us"}}))]
    #[test_case(json!({"kind": "verify_v1", "data": {"auth_token": "tok_1234"}}))]
    #[test_case(json!({"kind": "verify_v1", "data": {"public_key": "ob_1234", "user_data": {"id.first_name": "Hayes"}, "options": {"show_logo": false}}}))]
    fn test_backcompat(value: serde_json::Value) {
        let args: SdkArgs = serde_json::value::from_value(value.clone()).unwrap();
        args.validate().unwrap();
        let serialized_value = serde_json::value::to_value(args).unwrap();
        assert_eq!(value, serialized_value);
    }
}
