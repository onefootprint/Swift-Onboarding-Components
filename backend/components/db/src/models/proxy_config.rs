use crate::PgConn;
use crate::{
    schema::{
        proxy_config, proxy_config_header, proxy_config_ingress_rule, proxy_config_secret_header,
        proxy_config_server_cert,
    },
    DbResult, TxnPgConn,
};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Identifiable, Insertable, Queryable};
use newtypes::{
    ProxyConfigId, ProxyConfigIngressRuleId, ProxyConfigItemId, ProxyIngressContentType, SealedVaultBytes,
    TenantId,
};

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
    pub id: ProxyConfigItemId,
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
    #[tracing::instrument(skip_all)]
    pub fn create_new(conn: &mut TxnPgConn, args: NewProxyConfigArgs) -> DbResult<Self> {
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

        diesel::insert_into(crate::schema::proxy_config_header::table)
            .values(custom_headers)
            .execute(conn.conn())?;

        let custom_secret_headers = custom_header_secrets
            .into_iter()
            .map(|(name, e_data)| NewProxyConfigSecretHeader {
                config_id: proxy_config.id.clone(),
                name,
                e_data,
            })
            .collect::<Vec<_>>();

        diesel::insert_into(crate::schema::proxy_config_secret_header::table)
            .values(custom_secret_headers)
            .execute(conn.conn())?;

        let server_certs = server_certs
            .into_iter()
            .map(|cert_der| NewProxyConfigServerCert {
                config_id: proxy_config.id.clone(),
                cert_hash: crypto::sha256(&cert_der).to_vec(),
                cert_der,
            })
            .collect::<Vec<_>>();

        diesel::insert_into(crate::schema::proxy_config_server_cert::table)
            .values(server_certs)
            .execute(conn.conn())?;

        let ingress_rules = ingress_rules
            .into_iter()
            .map(|(token_path, target)| NewProxyConfigIngressRule {
                config_id: proxy_config.id.clone(),
                token_path,
                target,
            })
            .collect::<Vec<_>>();

        diesel::insert_into(crate::schema::proxy_config_ingress_rule::table)
            .values(ingress_rules)
            .execute(conn.conn())?;

        Ok(proxy_config)
    }

    #[tracing::instrument(skip_all)]
    pub fn list(conn: &mut PgConn, tenant_id: &TenantId, is_live: bool) -> DbResult<Vec<Self>> {
        let result = proxy_config::table
            .filter(proxy_config::tenant_id.eq(tenant_id))
            .filter(proxy_config::is_live.eq(is_live))
            .get_results(conn)?;

        Ok(result)
    }

    #[tracing::instrument(skip_all)]
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
}
