use crate::{config::Config, decision::TenantVendorControlError, enclave_client::EnclaveClient};
use db::models::tenant_vendor::TenantVendorControl as DbTenantVendorControl;
use newtypes::{vendor_credentials::IdologyCredentials, EncryptedVaultPrivateKey, PiiString};

#[derive(Clone, PartialEq, Eq, Debug)]
/// A struct for adapting db::models::TenantVendorControl for use in the api crate
pub struct TenantVendorControl {
    pub vendor_control: Option<DbTenantVendorControl>,
    idology_credentials: IdologyCredentials,
}

impl TenantVendorControl {
    pub async fn new(
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

        // eventually we'll want to do some validations here, like checking the db is configured for at least 1 KYC vendor, but for now let's not validate in constructor
        let control = Self {
            vendor_control,
            idology_credentials,
        };

        Ok(control)
    }

    // Accessors
    pub fn idology_credentials(&self) -> IdologyCredentials {
        self.idology_credentials.clone()
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
}

impl std::default::Default for TenantVendorControl {
    fn default() -> Self {
        Self {
            vendor_control: None,
            idology_credentials: IdologyCredentials {
                username: PiiString::from(""),
                password: PiiString::from(""),
            },
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
