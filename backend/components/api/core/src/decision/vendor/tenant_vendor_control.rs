use crate::{config::Config, enclave_client::EnclaveClient, errors::ApiResult};
use db::{
    models::{tenant::Tenant, tenant_vendor::TenantVendorControl as DbTenantVendorControl},
    DbPool, DbResult,
};
use idv::{
    experian::ExperianCrossCoreRequest,
    idology::{pa::IdologyPaRequest, IdologyExpectIDRequest},
};
use newtypes::{
    vendor_credentials::{
        ExperianCredentialBuilder, ExperianCredentials, IdologyCredentials, IncodeCredentials,
        LexisCredentials, MiddeskCredentials,
    },
    IdvData, IncodeEnvironment, PiiString, TenantId, Vendor, VendorAPI,
};

#[derive(Clone, PartialEq, Eq, Debug, Default)]
/// A struct for adapting db::models::TenantVendorControl for use in the api crate
pub struct TenantVendorControl {
    vendor_control: Option<DbTenantVendorControl>,
    idology_credentials: IdologyCredentials,
    experian_credentials: ExperianCredentials,
    lexis_credentials: LexisCredentials,
    incode_credentials: IncodeCredentials,
    middesk_credentials: MiddeskCredentials,
    incode_sandbox_credentials: IncodeSandboxCredentials,
    enabled_vendor_apis: Vec<VendorAPI>,
    tenant_id: TenantId,
    tenant_name: String,
}

impl TenantVendorControl {
    pub async fn new(
        tenant_id: TenantId,
        db_pool: &DbPool,
        config: &Config,
        enclave_client: &EnclaveClient,
    ) -> ApiResult<TenantVendorControl> {
        let (tenant, vendor_control) = db_pool
            .db_query(move |conn| -> DbResult<_> {
                let t = Tenant::get(conn, &tenant_id)?;
                let tvc = DbTenantVendorControl::get(conn, t.id.clone())?;

                Ok((t, tvc))
            })
            .await??;

        Self::new_internal(vendor_control, config, enclave_client, tenant).await
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

    // Requests
    pub fn build_idology_request(&self, idv_data: IdvData) -> IdologyExpectIDRequest {
        IdologyExpectIDRequest {
            idv_data,
            credentials: self.idology_credentials(),
            tenant_identifier: self.tenant_identifier(),
        }
    }
    pub fn build_experian_request(&self, idv_data: IdvData) -> ExperianCrossCoreRequest {
        ExperianCrossCoreRequest {
            idv_data,
            credentials: self.experian_credentials(),
        }
    }

    pub fn build_idology_pa_request(&self, idv_data: IdvData) -> IdologyPaRequest {
        IdologyPaRequest {
            idv_data,
            credentials: self.idology_credentials(),
            tenant_identifier: self.tenant_identifier(),
        }
    }
}

impl TenantVendorControl {
    async fn new_internal(
        vendor_control: Option<DbTenantVendorControl>,
        config: &Config,
        enclave_client: &EnclaveClient,
        tenant: Tenant,
    ) -> ApiResult<Self> {
        // As of 2023-06-28 we just use our default idology credentials for all tenants
        let idology_credentials = IdologyCredentials::from(config);

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

        // stash the enabled APIs on TVC
        let enabled_vendor_apis = Self::get_enabled_vendor_apis(&vendor_control);

        // eventually we'll want to do some validations here, like checking the db is configured for at least 1 KYC vendor, but for now let's not validate in constructor
        let control = Self {
            vendor_control,
            idology_credentials,
            experian_credentials,
            lexis_credentials,
            enabled_vendor_apis,
            incode_credentials,
            middesk_credentials,
            incode_sandbox_credentials,
            tenant_name: tenant.name,
            tenant_id: tenant.id,
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
    fn get_enabled_vendor_apis(vendor_control: &Option<DbTenantVendorControl>) -> Vec<VendorAPI> {
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

            if tvc.lexis_enabled {
                apis.push(VendorAPI::LexisFlexId);
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
}

impl TenantVendorControl {
    #[cfg(test)]
    pub async fn new_for_test(
        config: &Config,
        enclave_client: &EnclaveClient,
        vendor_control: Option<DbTenantVendorControl>,
        tenant: Tenant,
    ) -> ApiResult<Self> {
        Self::new_internal(vendor_control, config, enclave_client, tenant).await
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
