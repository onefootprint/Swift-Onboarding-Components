use crate::{
    config::Config, decision::TenantVendorControlError, enclave_client::EnclaveClient, errors::ApiResult,
    State,
};
use db::{
    models::{
        tenant::{Tenant, TenantIdentifier},
        tenant_vendor::TenantVendorControl as DbTenantVendorControl,
    },
    DbResult, PgConn,
};
use newtypes::{
    vendor_credentials::{ExperianCredentialBuilder, ExperianCredentials, IdologyCredentials},
    EncryptedVaultPrivateKey, PiiString, Vendor, VendorAPI,
};

pub struct TenantVendorControlBuilder {
    tenant_e_private_key: EncryptedVaultPrivateKey,
    vendor_control: Option<DbTenantVendorControl>,
}
impl TenantVendorControlBuilder {
    pub fn new<'a, T>(conn: &mut PgConn, id: T) -> DbResult<Self>
    where
        T: Into<TenantIdentifier<'a>>,
    {
        let t = Tenant::get(conn, id)?;
        let tvc = DbTenantVendorControl::get(conn, t.id.clone())?;

        Ok(Self {
            tenant_e_private_key: t.e_private_key,
            vendor_control: tvc,
        })
    }

    pub async fn build(self, state: &State) -> ApiResult<TenantVendorControl> {
        let res = TenantVendorControl::new(
            &state.config,
            self.vendor_control,
            &state.enclave_client,
            &self.tenant_e_private_key,
        )
        .await
        .map_err(crate::decision::Error::from)?;

        Ok(res)
    }
}

#[derive(Clone, PartialEq, Eq, Debug)]
/// A struct for adapting db::models::TenantVendorControl for use in the api crate
pub struct TenantVendorControl {
    vendor_control: Option<DbTenantVendorControl>,
    idology_credentials: IdologyCredentials,
    experian_credentials: ExperianCredentials,
    enabled_vendor_apis: Vec<VendorAPI>,
}

impl TenantVendorControl {
    async fn new(
        config: &Config,
        vendor_control: Option<DbTenantVendorControl>,
        enclave_client: &EnclaveClient,
        tenant_e_private_key: &EncryptedVaultPrivateKey,
    ) -> Result<Self, TenantVendorControlError> {
        // Check if this tenant has specific IDology credentials, if not, fall back to default creds from state
        // In the future we'll error here
        let idology_credentials = if let Some(id_creds) =
            Self::get_tenant_idology_credentials(&vendor_control, enclave_client, tenant_e_private_key)
                .await?
        {
            id_creds
        } else {
            IdologyCredentials::from(config)
        };

        // For experian, we use the bulk of the same credentials, just need to update subscriber code
        let experian_credential_builder = ExperianCredentialBuilder::from(config);
        let experian_subscriber_code =
            if let Some(sub_code) = Self::get_experian_subscriber_code(&vendor_control) {
                sub_code
            } else {
                // TODO: upstream this to config
                "2956241".to_string().into()
            };
        let experian_credentials =
            experian_credential_builder.build_with_subscriber_code(experian_subscriber_code);

        // stash the enabled APIs on TVC
        let enabled_vendor_apis = Self::get_enabled_vendor_apis(&vendor_control);

        // eventually we'll want to do some validations here, like checking the db is configured for at least 1 KYC vendor, but for now let's not validate in constructor
        let control = Self {
            vendor_control,
            idology_credentials,
            experian_credentials,
            enabled_vendor_apis,
        };

        Ok(control)
    }

    // Accessors
    pub fn idology_credentials(&self) -> IdologyCredentials {
        self.idology_credentials.clone()
    }

    pub fn experian_credentials(&self) -> ExperianCredentials {
        self.experian_credentials.clone()
    }

    pub fn enabled_vendor_apis(&self) -> Vec<VendorAPI> {
        self.enabled_vendor_apis.clone()
    }
}

impl TenantVendorControl {
    async fn get_tenant_idology_credentials(
        vendor_control: &Option<DbTenantVendorControl>,
        enclave_client: &EnclaveClient,
        tenant_e_private_key: &EncryptedVaultPrivateKey,
    ) -> Result<Option<IdologyCredentials>, TenantVendorControlError> {
        if let Some(vc) = vendor_control {
            match (
                vc.idology_enabled,
                vc.idology_username.clone(),
                vc.idology_e_password.clone(),
            ) {
                (true, Some(un), Some(pw)) => {
                    let decrypted_pw = enclave_client
                        .decrypt_to_piistring(
                            &pw,
                            tenant_e_private_key,
                            enclave_proxy::DataTransform::Identity,
                        )
                        .await?;

                    Ok(Some(IdologyCredentials {
                        username: un.into(),
                        password: decrypted_pw,
                    }))
                }
                _ => {
                    tracing::warn!(vendor_control_id=%vc.id, "missing idology credentials for tenant vendor control");

                    Ok(None)
                }
            }
        } else {
            Ok(None)
        }
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
        let mut apis = vec![
            VendorAPI::TwilioLookupV2,
            VendorAPI::SocureIDPlus,
            VendorAPI::MiddeskCreateBusiness,
        ];

        // If we have a vendor control, we defer to that for checking Experian and Idology
        if let Some(tvc) = vendor_control {
            if tvc.idology_enabled && tvc.idology_e_password.is_some() && tvc.idology_username.is_some() {
                all_idology_vendor_apis.into_iter().for_each(|a| apis.push(a));
            }

            if tvc.experian_enabled && tvc.experian_subscriber_code.is_some() {
                apis.push(VendorAPI::ExperianPreciseID);
            }
        } else {
            // If we do not, we enable Idology APIs by default
            all_idology_vendor_apis.into_iter().for_each(|a| apis.push(a));
        }

        apis
    }
}

impl TenantVendorControl {
    #[cfg(test)]
    pub async fn new_for_test(
        config: &Config,
        vendor_control: Option<DbTenantVendorControl>,
        enclave_client: &EnclaveClient,
        tenant_e_private_key: &EncryptedVaultPrivateKey,
    ) -> Result<Self, TenantVendorControlError> {
        Self::new(config, vendor_control, enclave_client, tenant_e_private_key).await
    }
}

impl std::default::Default for TenantVendorControl {
    fn default() -> Self {
        Self {
            vendor_control: None,
            idology_credentials: IdologyCredentials {
                username: PiiString::from(""),
                password: PiiString::from(""),
            },
            experian_credentials: ExperianCredentials {
                subscriber_code: PiiString::from(""),
                auth_username: PiiString::from(""),
                auth_password: PiiString::from(""),
                auth_client_id: PiiString::from(""),
                auth_client_secret: PiiString::from(""),
                cross_core_username: PiiString::from(""),
                cross_core_password: PiiString::from(""),
            },
            enabled_vendor_apis: vec![],
        }
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

impl From<&Config> for ExperianCredentialBuilder {
    fn from(_config: &Config) -> Self {
        ExperianCredentialBuilder {
            auth_username: PiiString::from("crosscore2.uat@onefootprint.com"),
            auth_password: PiiString::from(""),
            auth_client_id: PiiString::from(""),
            auth_client_secret: PiiString::from(""),
            cross_core_username: PiiString::from(""),
            cross_core_password: PiiString::from(""),
        }
    }
}
