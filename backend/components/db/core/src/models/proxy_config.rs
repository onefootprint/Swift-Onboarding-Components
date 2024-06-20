use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::proxy_config;
use db_schema::schema::proxy_config_header;
use db_schema::schema::proxy_config_ingress_rule;
use db_schema::schema::proxy_config_secret_header;
use db_schema::schema::proxy_config_server_cert;
use diesel::prelude::*;
use diesel::Identifiable;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::ApiKeyStatus;
use newtypes::ProxyConfigId;
use newtypes::ProxyConfigIngressRuleId;
use newtypes::ProxyConfigItemId;
use newtypes::ProxyConfigSecretHeaderId;
use newtypes::ProxyIngressContentType;
use newtypes::SealedVaultBytes;
use newtypes::TenantId;

#[derive(Debug, Queryable, Identifiable)]
#[diesel(table_name = proxy_config)]
pub struct ProxyConfig {
    pub id: ProxyConfigId,
    pub tenant_id: TenantId,
    pub is_live: bool,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub url: String,
    pub method: String,
    pub client_identity_cert_der: Option<Vec<u8>>,
    pub e_client_identity_key_der: Option<SealedVaultBytes>,
    pub ingress_content_type: Option<ProxyIngressContentType>,
    pub access_reason: Option<String>,
    pub status: ApiKeyStatus,
    pub deactivated_at: Option<DateTime<Utc>>,
}

#[derive(Queryable, Debug, Identifiable)]
#[diesel(table_name = proxy_config_header)]
pub struct ProxyConfigHeader {
    pub id: ProxyConfigItemId,
    pub config_id: ProxyConfigId,
    pub name: String,
    pub value: String,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = proxy_config_header)]
struct NewProxyConfigHeader {
    config_id: ProxyConfigId,
    name: String,
    value: String,
}

#[derive(Queryable, Debug, Identifiable)]
#[diesel(table_name = proxy_config_ingress_rule)]
pub struct ProxyConfigIngressRule {
    pub id: ProxyConfigIngressRuleId,
    pub config_id: ProxyConfigId,
    pub token_path: String,
    pub target: String,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = proxy_config_ingress_rule)]
struct NewProxyConfigIngressRule {
    config_id: ProxyConfigId,
    token_path: String,
    target: String,
}

#[derive(Queryable, Debug, Identifiable)]
#[diesel(table_name = proxy_config_secret_header)]
pub struct ProxyConfigSecretHeader {
    pub id: ProxyConfigSecretHeaderId,
    pub config_id: ProxyConfigId,
    pub name: String,
    pub e_data: SealedVaultBytes,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = proxy_config_secret_header)]
struct NewProxyConfigSecretHeader {
    config_id: ProxyConfigId,
    name: String,
    e_data: SealedVaultBytes,
}

#[derive(Queryable, Debug, Identifiable)]
#[diesel(primary_key(config_id))]
#[diesel(table_name = proxy_config_server_cert)]
pub struct ProxyConfigServerCert {
    pub id: ProxyConfigItemId,
    pub config_id: ProxyConfigId,
    pub cert_hash: Vec<u8>,
    pub cert_der: Vec<u8>,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = proxy_config_server_cert)]
struct NewProxyConfigServerCert {
    config_id: ProxyConfigId,
    cert_hash: Vec<u8>,
    cert_der: Vec<u8>,
}

#[derive(Debug, Insertable)]
#[diesel(table_name = proxy_config)]
struct NewProxyConfig {
    tenant_id: TenantId,
    is_live: bool,
    name: String,
    url: String,
    method: String,
    client_identity_cert_der: Option<Vec<u8>>,
    e_client_identity_key_der: Option<SealedVaultBytes>,
    ingress_content_type: Option<ProxyIngressContentType>,
    access_reason: Option<String>,
    status: ApiKeyStatus,
}

#[derive(Debug, AsChangeset)]
#[diesel(table_name = proxy_config)]
struct UpdateProxyConfig {
    name: Option<String>,
    url: Option<String>,
    method: Option<String>,
    client_identity_cert_der: Option<Option<Vec<u8>>>,
    e_client_identity_key_der: Option<Option<SealedVaultBytes>>,
    ingress_content_type: Option<Option<ProxyIngressContentType>>,
    access_reason: Option<String>,
    status: Option<ApiKeyStatus>,
}

#[derive(Debug)]
pub struct NewProxyConfigArgs {
    pub tenant_id: TenantId,
    pub is_live: bool,
    pub name: String,
    pub url: String,
    pub method: String,
    pub client_identity_cert_der: Option<Vec<u8>>,
    pub e_client_identity_key_der: Option<SealedVaultBytes>,
    pub ingress_content_type: Option<ProxyIngressContentType>,
    pub custom_headers: Vec<(String, String)>,
    pub custom_header_secrets: Vec<(String, SealedVaultBytes)>,
    pub server_certs: Vec<Vec<u8>>,
    pub ingress_rules: Vec<(String, String)>,
    pub access_reason: Option<String>,
}

#[derive(Debug)]
pub struct UpdateProxyConfigArgs {
    pub tenant_id: TenantId,
    pub is_live: bool,
    pub config_id: ProxyConfigId,
    pub status: Option<ApiKeyStatus>,
    pub name: Option<String>,
    pub url: Option<String>,
    pub method: Option<String>,
    pub client_identity_cert_der: Option<Option<Vec<u8>>>,
    pub e_client_identity_key_der: Option<Option<SealedVaultBytes>>,
    pub ingress_content_type: Option<Option<ProxyIngressContentType>>,
    pub custom_headers: Option<Vec<(String, String)>>,
    pub custom_header_secrets: Option<Vec<(String, SealedVaultBytes)>>,
    pub delete_custom_header_secrets: Vec<ProxyConfigSecretHeaderId>,
    pub server_certs: Option<Vec<Vec<u8>>>,
    pub ingress_rules: Option<Vec<(String, String)>>,
    pub access_reason: Option<String>,
}

pub struct ProxyConfigFilters<'a> {
    pub status: Option<ApiKeyStatus>,
    pub tenant_id: &'a TenantId,
    pub is_live: bool,
}

/// a helper type for holding all of the proxy config
/// related rows in a single type
pub type DbProxyConfigAll = (
    ProxyConfig,
    Vec<ProxyConfigHeader>,
    Vec<ProxyConfigSecretHeader>,
    Vec<ProxyConfigServerCert>,
    Vec<ProxyConfigIngressRule>,
);

impl ProxyConfig {
    /// create a new proxy config along with other config tables
    #[tracing::instrument("ProxyConfig::create_new", skip_all)]
    pub fn create_new(conn: &mut TxnPgConn, args: NewProxyConfigArgs) -> DbResult<DbProxyConfigAll> {
        let NewProxyConfigArgs {
            tenant_id,
            is_live,
            name,
            url,
            method,
            client_identity_cert_der,
            e_client_identity_key_der,
            ingress_content_type,
            custom_headers,
            custom_header_secrets,
            server_certs,
            ingress_rules,
            access_reason,
        } = args;

        let new = NewProxyConfig {
            tenant_id,
            is_live,
            name,
            url,
            method,
            client_identity_cert_der,
            e_client_identity_key_der,
            ingress_content_type,
            access_reason,
            status: ApiKeyStatus::Enabled,
        };

        let proxy_config: ProxyConfig = diesel::insert_into(proxy_config::table)
            .values(new)
            .get_result(conn.conn())?;

        let custom_headers = custom_headers
            .into_iter()
            .map(|(name, value)| NewProxyConfigHeader {
                config_id: proxy_config.id.clone(),
                name,
                value,
            })
            .collect::<Vec<NewProxyConfigHeader>>();

        let custom_headers = diesel::insert_into(db_schema::schema::proxy_config_header::table)
            .values(custom_headers)
            .get_results(conn.conn())?;

        let custom_secret_headers = custom_header_secrets
            .into_iter()
            .map(|(name, e_data)| NewProxyConfigSecretHeader {
                config_id: proxy_config.id.clone(),
                name,
                e_data,
            })
            .collect::<Vec<_>>();

        let custom_secret_headers = diesel::insert_into(db_schema::schema::proxy_config_secret_header::table)
            .values(custom_secret_headers)
            .get_results(conn.conn())?;

        let server_certs = server_certs
            .into_iter()
            .map(|cert_der| NewProxyConfigServerCert {
                config_id: proxy_config.id.clone(),
                cert_hash: crypto::sha256(&cert_der).to_vec(),
                cert_der,
            })
            .collect::<Vec<_>>();

        let server_certs = diesel::insert_into(db_schema::schema::proxy_config_server_cert::table)
            .values(server_certs)
            .get_results(conn.conn())?;

        let ingress_rules = ingress_rules
            .into_iter()
            .map(|(token_path, target)| NewProxyConfigIngressRule {
                config_id: proxy_config.id.clone(),
                token_path,
                target,
            })
            .collect::<Vec<_>>();

        let ingress_rules = diesel::insert_into(db_schema::schema::proxy_config_ingress_rule::table)
            .values(ingress_rules)
            .get_results(conn.conn())?;

        Ok((
            proxy_config,
            custom_headers,
            custom_secret_headers,
            server_certs,
            ingress_rules,
        ))
    }

    /// updates an existing proxy configuration
    #[tracing::instrument("ProxyConfig::update", skip_all)]
    pub fn update(conn: &mut TxnPgConn, args: UpdateProxyConfigArgs) -> DbResult<DbProxyConfigAll> {
        let UpdateProxyConfigArgs {
            tenant_id,
            is_live,
            config_id,
            status,
            name,
            url,
            method,
            client_identity_cert_der,
            e_client_identity_key_der,
            ingress_content_type,
            custom_headers,
            custom_header_secrets,
            delete_custom_header_secrets,
            server_certs,
            ingress_rules,
            access_reason,
        } = args;

        let update = UpdateProxyConfig {
            name,
            url,
            status,
            method,
            client_identity_cert_der,
            e_client_identity_key_der,
            ingress_content_type,
            access_reason,
        };

        let proxy_config: ProxyConfig = diesel::update(proxy_config::table)
            .filter(proxy_config::id.eq(&config_id))
            .filter(proxy_config::tenant_id.eq(tenant_id))
            .filter(proxy_config::is_live.eq(is_live))
            .set(update)
            .get_result(conn.conn())?;

        // for each dependent list of values, delete the old, insert the new
        let headers: Vec<ProxyConfigHeader> = if let Some(custom_headers) = custom_headers {
            let _ = diesel::delete(proxy_config_header::table)
                .filter(proxy_config_header::config_id.eq(&config_id))
                .execute(conn.conn())?;

            let custom_headers = custom_headers
                .into_iter()
                .map(|(name, value)| NewProxyConfigHeader {
                    config_id: proxy_config.id.clone(),
                    name,
                    value,
                })
                .collect::<Vec<NewProxyConfigHeader>>();

            diesel::insert_into(db_schema::schema::proxy_config_header::table)
                .values(custom_headers)
                .get_results(conn.conn())?
        } else {
            proxy_config_header::table
                .filter(proxy_config_header::config_id.eq(&config_id))
                .get_results(conn.conn())?
        };

        // secret headers are added additively as cannot be updated atomically.
        if let Some(custom_header_secrets) = custom_header_secrets {
            let _ = diesel::delete(proxy_config_secret_header::table)
                .filter(proxy_config_secret_header::config_id.eq(&config_id))
                .filter(proxy_config_secret_header::id.eq_any(&delete_custom_header_secrets))
                .execute(conn.conn())?;

            let custom_secret_headers = custom_header_secrets
                .into_iter()
                .map(|(name, e_data)| NewProxyConfigSecretHeader {
                    config_id: proxy_config.id.clone(),
                    name,
                    e_data,
                })
                .collect::<Vec<_>>();

            let _ = diesel::insert_into(db_schema::schema::proxy_config_secret_header::table)
                .values(custom_secret_headers)
                .execute(conn.conn())?;
        }
        let secret_headers = proxy_config_secret_header::table
            .filter(proxy_config_secret_header::config_id.eq(&config_id))
            .get_results(conn.conn())?;

        let server_certs: Vec<ProxyConfigServerCert> = if let Some(server_certs) = server_certs {
            let _ = diesel::delete(proxy_config_server_cert::table)
                .filter(proxy_config_server_cert::config_id.eq(&config_id))
                .execute(conn.conn())?;

            let server_certs = server_certs
                .into_iter()
                .map(|cert_der| NewProxyConfigServerCert {
                    config_id: proxy_config.id.clone(),
                    cert_hash: crypto::sha256(&cert_der).to_vec(),
                    cert_der,
                })
                .collect::<Vec<_>>();

            diesel::insert_into(db_schema::schema::proxy_config_server_cert::table)
                .values(server_certs)
                .get_results(conn.conn())?
        } else {
            proxy_config_server_cert::table
                .filter(proxy_config_server_cert::config_id.eq(&config_id))
                .get_results(conn.conn())?
        };

        let ingress_rules: Vec<ProxyConfigIngressRule> = if let Some(ingress_rules) = ingress_rules {
            let _ = diesel::delete(proxy_config_ingress_rule::table)
                .filter(proxy_config_ingress_rule::config_id.eq(&config_id))
                .execute(conn.conn())?;

            let ingress_rules = ingress_rules
                .into_iter()
                .map(|(token_path, target)| NewProxyConfigIngressRule {
                    config_id: proxy_config.id.clone(),
                    token_path,
                    target,
                })
                .collect::<Vec<_>>();

            diesel::insert_into(db_schema::schema::proxy_config_ingress_rule::table)
                .values(ingress_rules)
                .get_results(conn.conn())?
        } else {
            proxy_config_ingress_rule::table
                .filter(proxy_config_ingress_rule::config_id.eq(&config_id))
                .get_results(conn.conn())?
        };

        Ok((proxy_config, headers, secret_headers, server_certs, ingress_rules))
    }

    #[tracing::instrument("ProxyConfig::list", skip_all)]
    pub fn list(conn: &mut PgConn, filters: ProxyConfigFilters) -> DbResult<Vec<Self>> {
        let mut query = proxy_config::table
            .filter(proxy_config::tenant_id.eq(filters.tenant_id))
            .filter(proxy_config::is_live.eq(filters.is_live))
            .filter(proxy_config::deactivated_at.is_null())
            .into_boxed();
        if let Some(status) = filters.status {
            query = query.filter(proxy_config::status.eq(status));
        }
        let result = query
            .order_by(proxy_config::created_at.desc())
            .get_results(conn)?;

        Ok(result)
    }

    #[tracing::instrument("ProxyConfig::find", skip_all)]
    pub fn find(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        is_live: bool,
        proxy_config_id: ProxyConfigId,
    ) -> DbResult<DbProxyConfigAll> {
        let config: ProxyConfig = proxy_config::table
            .filter(proxy_config::tenant_id.eq(tenant_id))
            .filter(proxy_config::is_live.eq(is_live))
            .filter(proxy_config::id.eq(proxy_config_id))
            .filter(proxy_config::deactivated_at.is_null())
            .get_result(conn)?;

        let headers = proxy_config_header::table
            .filter(proxy_config_header::config_id.eq(&config.id))
            .get_results(conn)?;
        let secret_headers = proxy_config_secret_header::table
            .filter(proxy_config_secret_header::config_id.eq(&config.id))
            .get_results(conn)?;
        let server_certs = proxy_config_server_cert::table
            .filter(proxy_config_server_cert::config_id.eq(&config.id))
            .get_results(conn)?;
        let ingress_rules = proxy_config_ingress_rule::table
            .filter(proxy_config_ingress_rule::config_id.eq(&config.id))
            .get_results(conn)?;

        Ok((config, headers, secret_headers, server_certs, ingress_rules))
    }

    /// updates an existing proxy configuration
    #[tracing::instrument("ProxyConfig::deactivate", skip_all)]
    pub fn deactivate(
        conn: &mut TxnPgConn,
        proxy_config_id: ProxyConfigId,
        tenant_id: TenantId,
        is_live: bool,
    ) -> DbResult<()> {
        diesel::update(proxy_config::table)
            .filter(proxy_config::tenant_id.eq(tenant_id))
            .filter(proxy_config::is_live.eq(is_live))
            .filter(proxy_config::id.eq(proxy_config_id))
            .set(proxy_config::deactivated_at.eq(Utc::now()))
            .execute(conn.conn())?;

        Ok(())
    }
}
