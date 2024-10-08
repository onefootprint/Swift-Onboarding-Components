use crate::config::Config;
use crate::enclave_client::DecryptReq;
use crate::enclave_client::EnclaveClient;
use crate::utils;
use crate::FpResult;
use api_errors::AssertionError;
use db::models::tenant::Tenant;
use db::models::tenant_business_info::TenantBusinessInfo;
use db::models::tenant_vendor::TenantVendorControl as DbTenantVendorControl;
use db::DbPool;
use db::DbResult;
use newtypes::vendor_credentials::ExperianCredentialBuilder;
use newtypes::vendor_credentials::ExperianCredentials;
use newtypes::vendor_credentials::IdologyCredentials;
use newtypes::vendor_credentials::IncodeCredentials;
use newtypes::vendor_credentials::LexisCredentials;
use newtypes::vendor_credentials::MiddeskCredentials;
use newtypes::vendor_credentials::NeuroIdApiKeys;
use newtypes::vendor_credentials::SambaSafetyCredentials;
use newtypes::vendor_credentials::SentilinkCredentials;
use newtypes::IncodeEnvironment;
use newtypes::PiiString;
use newtypes::TenantId;
use newtypes::Vendor;
use newtypes::VendorAPI;

#[derive(Clone, Debug, Default)]
/// A struct for adapting db::models::TenantVendorControl for use in the api crate
pub struct TenantVendorControl {
    idology_credentials: IdologyCredentials,
    experian_credentials: ExperianCredentials,
    lexis_credentials: LexisCredentials,
    incode_credentials: IncodeCredentials,
    middesk_credentials: MiddeskCredentials,
    incode_sandbox_credentials: IncodeSandboxCredentials,
    enabled_vendor_apis: Vec<VendorAPI>,
    tenant_id: TenantId,
    tenant_name: String,
    tbi: Option<newtypes::TenantBusinessInfo>,
    neuro_id_api_key: NeuroIdApiKeys,
    samba_safety_credentials: SambaSafetyCredentials,
    sentilink_credentials: SentilinkCredentialType,
}

impl TenantVendorControl {
    pub async fn new(
        tenant_id: TenantId,
        db_pool: &DbPool,
        config: &Config,
        enclave_client: &EnclaveClient,
    ) -> FpResult<TenantVendorControl> {
        let (tenant, vendor_control, tbi) = db_pool
            .db_query(move |conn| -> DbResult<_> {
                let t = Tenant::get(conn, &tenant_id)?;
                let tvc = DbTenantVendorControl::get(conn, &t.id)?;
                let tbi = TenantBusinessInfo::get(conn, &t.id)?;

                Ok((t, tvc, tbi))
            })
            .await?;

        Self::new_internal(vendor_control, config, enclave_client, tenant, tbi).await
    }

    // Accessors
    pub fn tenant_id(&self) -> TenantId {
        self.tenant_id.clone()
    }

    pub fn idology_credentials(&self) -> IdologyCredentials {
        self.idology_credentials.clone()
    }

    pub fn experian_credentials(&self) -> ExperianCredentials {
        self.experian_credentials.clone()
    }

    pub fn lexis_credentials(&self) -> LexisCredentials {
        self.lexis_credentials.clone()
    }

    pub fn samba_credentials(&self) -> SambaSafetyCredentials {
        self.samba_safety_credentials.clone()
    }

    pub fn sentilink_credentials(&self) -> SentilinkCredentialType {
        self.sentilink_credentials.clone()
    }

    pub fn incode_credentials(&self, incode_environment: IncodeEnvironment) -> IncodeCredentials {
        match incode_environment {
            IncodeEnvironment::Demo => self.incode_sandbox_credentials.0.clone(),
            IncodeEnvironment::Production => self.incode_credentials.clone(),
        }
    }

    pub fn middesk_credentials(&self) -> MiddeskCredentials {
        self.middesk_credentials.clone()
    }

    pub fn enabled_vendor_apis(&self) -> Vec<VendorAPI> {
        self.enabled_vendor_apis.clone()
    }

    pub fn tenant_business_info(&self) -> Option<newtypes::TenantBusinessInfo> {
        self.tbi.clone()
    }

    pub fn neuro_api_key(&self) -> NeuroIdApiKeys {
        self.neuro_id_api_key.clone()
    }
}

impl TenantVendorControl {
    async fn new_internal(
        vendor_control: Option<DbTenantVendorControl>,
        config: &Config,
        enclave_client: &EnclaveClient,
        tenant: Tenant,
        tbi: Option<TenantBusinessInfo>,
    ) -> FpResult<Self> {
        // As of 2023-06-28 we just use our default idology credentials for all tenants
        let idology_credentials = IdologyCredentials::from(config);
        // TODO: we'll likely need to have diff site_ids in the future that we store on playbooks so we will
        // refactor then
        let neuro_id_api_key = NeuroIdApiKeys::from(config);

        // For experian, we use the bulk of the same credentials, just need to update subscriber code
        let experian_credential_builder = ExperianCredentialBuilder::from(config);
        let experian_subscriber_code =
            if let Some(sub_code) = Self::get_experian_subscriber_code(&vendor_control) {
                sub_code
            } else {
                // use default
                config.experian.subscriber_code.clone()
            };
        let experian_credentials =
            experian_credential_builder.build_with_subscriber_code(experian_subscriber_code);

        let lexis_credentials = LexisCredentials::from(config);
        let samba_safety_credentials = SambaSafetyCredentials::from(config);
        let sentilink_credentials = if let Some(senti_creds) = vendor_control
            .as_ref()
            .and_then(|vc| vc.sentilink_credentials.clone())
        {
            let encrypted_data = [
                (SentilinkCreds::AuthUsername, senti_creds.account),
                (SentilinkCreds::AuthPassword, senti_creds.token),
            ];

            let data = encrypted_data
                .iter()
                .map(|(sc, bytes)| (sc, DecryptReq(&tenant.e_private_key, bytes, vec![])))
                .collect();

            let sentilink = enclave_client.batch_decrypt_to_piistring(data).await?;
            let creds = SentilinkCredentials {
                base_url: config.sentilink_config.base_url.clone(),
                auth_username: sentilink
                    .get(&SentilinkCreds::AuthUsername)
                    .ok_or(AssertionError("Missing decrypt field: SentilinkAuthUsername"))?
                    .clone(),
                auth_password: sentilink
                    .get(&SentilinkCreds::AuthPassword)
                    .ok_or(AssertionError("Missing decrypt field: SentilinkAuthPassword"))?
                    .clone(),
            };
            SentilinkCredentialType::TenantSpecific(creds)
        } else {
            let creds = SentilinkCredentials::from(config);
            SentilinkCredentialType::Default(creds)
        };
        // As of 2023-04-25, we only have a single set of incode credentials
        let incode_credentials = IncodeCredentials::from(config);
        let incode_sandbox_credentials = IncodeSandboxCredentials::from(config);

        let middesk_credentials = if let Some(middesk_api_key) =
            vendor_control.as_ref().and_then(|vc| vc.middesk_api_key.clone())
        {
            let middesk_api_key_plaintext = enclave_client
                .decrypt_to_piistring(&middesk_api_key, &tenant.e_private_key)
                .await?;
            MiddeskCredentials {
                api_key: middesk_api_key_plaintext,
            }
        } else {
            // if the tenants isnt using their own API key, then we use the global footprint one
            MiddeskCredentials::from(config)
        };

        let tbi = if let Some(tbi) = &tbi {
            Some(
                utils::tenant_business_info::decrypt_tenant_business_info(enclave_client, &tenant, tbi)
                    .await?,
            )
        } else {
            None
        };

        // stash the enabled APIs on TVC
        let enabled_vendor_apis = Self::get_enabled_vendor_apis(&vendor_control, tbi.as_ref());

        // eventually we'll want to do some validations here, like checking the db is configured for at
        // least 1 KYC vendor, but for now let's not validate in constructor
        let control = Self {
            idology_credentials,
            experian_credentials,
            lexis_credentials,
            enabled_vendor_apis,
            incode_credentials,
            middesk_credentials,
            incode_sandbox_credentials,
            tenant_name: tenant.name,
            tenant_id: tenant.id,
            tbi,
            neuro_id_api_key,
            samba_safety_credentials,
            sentilink_credentials,
        };

        Ok(control)
    }

    fn get_experian_subscriber_code(vendor_control: &Option<DbTenantVendorControl>) -> Option<PiiString> {
        if let Some(vc) = vendor_control {
            match (vc.experian_enabled, vc.experian_subscriber_code.clone()) {
                (true, Some(sub_code)) => Some(sub_code.into()),
                _ => {
                    tracing::warn!(vendor_control_id=%vc.id, "missing experian credentials for tenant vendor control");

                    None
                }
            }
        } else {
            None
        }
    }

    // Parse the db row and return which APIs are configured for the tenant
    fn get_enabled_vendor_apis(
        vendor_control: &Option<DbTenantVendorControl>,
        tbi: Option<&newtypes::TenantBusinessInfo>,
    ) -> Vec<VendorAPI> {
        let all_idology_vendor_apis = newtypes::vendor_apis_from_vendor(Vendor::Idology);
        // default vendors enabled for tenants
        let mut apis = vec![VendorAPI::MiddeskCreateBusiness];

        // If we have a vendor control, we defer to that for checking Experian and Idology
        if let Some(tvc) = vendor_control {
            if tvc.idology_enabled {
                all_idology_vendor_apis.into_iter().for_each(|a| apis.push(a));
            }

            if tvc.experian_enabled && tvc.experian_subscriber_code.is_some() {
                apis.push(VendorAPI::ExperianPreciseId);
            }

            // only consider Lexis enabled if we have a populated tenant_business_info for the tenant
            if tvc.lexis_enabled && tbi.is_some() {
                apis.push(VendorAPI::LexisFlexId);
            } else if tvc.lexis_enabled {
                tracing::error!("tvc.lexis_enabled = true but tenant is missing tenant_business_info");
            }
        } else {
            // If we do not, we enable Idology APIs by default
            all_idology_vendor_apis.into_iter().for_each(|a| apis.push(a));
        }

        apis
    }

    pub fn tenant_identifier(&self) -> String {
        format!("{}:{}", self.tenant_id, self.tenant_name)
    }

    pub fn is_sentilink_enabled_for_tenant(&self) -> bool {
        matches!(
            self.sentilink_credentials(),
            SentilinkCredentialType::TenantSpecific(_)
        )
    }
}

impl TenantVendorControl {
    #[cfg(test)]
    pub async fn new_for_test(
        config: &Config,
        enclave_client: &EnclaveClient,
        vendor_control: Option<DbTenantVendorControl>,
        tenant: Tenant,
    ) -> FpResult<Self> {
        Self::new_internal(vendor_control, config, enclave_client, tenant, None).await
    }
}

// Default credentials (for now) are found on State
impl From<&Config> for IdologyCredentials {
    fn from(config: &Config) -> Self {
        IdologyCredentials {
            username: config.idology_config.username.clone().into(),
            password: config.idology_config.password.clone().into(),
        }
    }
}

impl From<&Config> for IncodeCredentials {
    fn from(config: &Config) -> Self {
        IncodeCredentials {
            api_key: config.incode.api_key.clone(),
            base_url: config.incode.base_url.clone(),
        }
    }
}

impl From<&Config> for LexisCredentials {
    fn from(config: &Config) -> Self {
        LexisCredentials {
            user_id: config.lexis_config.user_id.clone(),
            password: config.lexis_config.password.clone(),
        }
    }
}

#[derive(Clone, PartialEq, Eq, Debug, Default)]
pub struct IncodeSandboxCredentials(pub IncodeCredentials);

impl From<&Config> for IncodeSandboxCredentials {
    fn from(config: &Config) -> Self {
        let creds = IncodeCredentials {
            api_key: config.incode.demo_api_key.clone(),
            base_url: config.incode.demo_base_url.clone(),
        };

        IncodeSandboxCredentials(creds)
    }
}

impl From<&Config> for MiddeskCredentials {
    fn from(config: &Config) -> Self {
        MiddeskCredentials {
            api_key: config.middesk_config.middesk_api_key.clone(),
        }
    }
}

impl From<&Config> for NeuroIdApiKeys {
    fn from(config: &Config) -> Self {
        NeuroIdApiKeys {
            key: config.neuro_id_config.api_key.clone(),
            test_key: config.neuro_id_config.api_key_test.clone(),
        }
    }
}

impl From<&Config> for SambaSafetyCredentials {
    fn from(config: &Config) -> Self {
        SambaSafetyCredentials {
            api_key: config.samba_safety_config.api_key.clone(),
            base_url: config.samba_safety_config.base_url.clone(),
            auth_username: config.samba_safety_config.auth_username.clone(),
            auth_password: config.samba_safety_config.auth_password.clone(),
        }
    }
}

impl From<&Config> for SentilinkCredentials {
    fn from(config: &Config) -> Self {
        SentilinkCredentials {
            base_url: config.sentilink_config.base_url.clone(),
            auth_username: config.sentilink_config.auth_username.clone(),
            auth_password: config.sentilink_config.auth_password.clone(),
        }
    }
}


impl From<&Config> for ExperianCredentialBuilder {
    fn from(config: &Config) -> Self {
        // only load real creds in prod
        if config.service_config.is_production() {
            ExperianCredentialBuilder {
                auth_username: config.experian.auth_username.clone(),
                auth_password: config.experian.auth_password.clone(),
                auth_client_id: config.experian.auth_client_id.clone(),
                auth_client_secret: config.experian.auth_client_secret.clone(),
                cross_core_username: config.experian.cross_core_username.clone(),
                cross_core_password: config.experian.cross_core_password.clone(),
            }
        } else {
            ExperianCredentialBuilder {
                auth_username: PiiString::from(""),
                auth_password: PiiString::from(""),
                auth_client_id: PiiString::from(""),
                auth_client_secret: PiiString::from(""),
                cross_core_username: PiiString::from(""),
                cross_core_password: PiiString::from(""),
            }
        }
    }
}

#[derive(Clone, Debug)]
pub enum SentilinkCredentialType {
    Default(SentilinkCredentials),
    TenantSpecific(SentilinkCredentials),
}

impl Default for SentilinkCredentialType {
    fn default() -> Self {
        let d = SentilinkCredentials::default();
        Self::Default(d)
    }
}

impl SentilinkCredentialType {
    pub fn try_into_tenant_specific_credentials(self) -> FpResult<SentilinkCredentials> {
        match self {
            SentilinkCredentialType::Default(_) => {
                Err(AssertionError("could not convert to tenant specific credentials").into())
            }
            SentilinkCredentialType::TenantSpecific(sentilink_credentials) => Ok(sentilink_credentials),
        }
    }

    pub fn into_unchecked_sentilink_credentials(self) -> SentilinkCredentials {
        match self {
            SentilinkCredentialType::Default(sentilink_credentials)
            | SentilinkCredentialType::TenantSpecific(sentilink_credentials) => sentilink_credentials,
        }
    }
}

#[derive(Hash, PartialEq, Eq)]
enum SentilinkCreds {
    AuthUsername,
    AuthPassword,
}
