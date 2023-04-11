use crate::{
    auth::{
        session::{AuthSessionData, ExtractableAuthSession},
        AuthError, SessionContext,
    },
    errors::ApiResult,
};
use db::{
    models::{business_owner::BusinessOwner, ob_configuration::ObConfiguration, tenant::Tenant},
    PgConn,
};
use feature_flag::LaunchDarklyFeatureFlagClient;
use newtypes::{BoId, ObConfigurationId};
use paperclip::actix::Apiv2Security;

/// A business-owner specific session. This is issued when sending out links to each owner of a
/// business in order to allow each BO to fill out the
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct BoSession {
    pub bo_id: BoId,
    pub ob_config_id: ObConfigurationId,
}

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Kyb-Bo-Token",
    description = "Token to initialize KYC of a business owner"
)]
pub struct ParsedBoSession {
    pub tenant: Tenant,
    pub ob_config: ObConfiguration,
    pub bo: BusinessOwner,
}

/// Auth extractor for a session to KYC a business owner
pub type BoSessionAuth = SessionContext<ParsedBoSession>;

impl ExtractableAuthSession for ParsedBoSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Kyb-Bo-Token"]
    }

    fn try_from(
        auth_session: AuthSessionData,
        conn: &mut PgConn,
        _: LaunchDarklyFeatureFlagClient,
    ) -> ApiResult<Self> {
        let data = match auth_session {
            AuthSessionData::BusinessOwner(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        let (ob_config, tenant) = ObConfiguration::get_enabled(conn, &data.ob_config_id)?;
        let bo = BusinessOwner::get(conn, &data.bo_id)?;
        // Note: the bo may or may not have a populated user_vault_id

        tracing::info!(tenant_id=%tenant.id, ob_config_id=%ob_config.id, bo_id=%bo.id, user_vault_id=%format!("{:?}", bo.user_vault_id), "kyb session authenticated");

        Ok(Self {
            ob_config,
            tenant,
            bo,
        })
    }
}
