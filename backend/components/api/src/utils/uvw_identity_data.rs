use db::models::fingerprint::IsUnique;
use db::models::identity_data::IdentityData;
use db::models::user_timeline::UserTimeline;

use db::TxnPgConnection;

use newtypes::email::Email as NewtypeEmail;

use db::models::ob_configuration::ObConfiguration;

use newtypes::{
    CollectedDataOption, DataAttribute, DataCollectedInfo, DataPriority, EmailId, Fingerprint, OnboardingId,
    SealedVaultBytes,
};

use crate::errors::{ApiError, ApiResult};
use crate::types::identity_data_request::IdentityDataUpdate;

use super::identity_data_builder::IdentityDataBuilder;
use super::user_vault_wrapper::UserVaultWrapper;
use db::HasDataAttributeFields;

/// UVW impls related to working with identity data stored in a UserVault
impl UserVaultWrapper {
    pub fn update_identity_data(
        &mut self,
        conn: &mut TxnPgConnection,
        update: IdentityDataUpdate,
        fingerprints: Vec<(DataAttribute, Fingerprint, IsUnique)>,
        onboarding_id: Option<OnboardingId>,
    ) -> Result<(), ApiError> {
        self.assert_is_locked(conn)?;
        let mut builder = IdentityDataBuilder::new(
            self.user_vault.is_portable,
            self.user_vault.id.clone(),
            self.identity_data.clone(),
            self.user_vault.public_key.clone(),
            fingerprints,
        );

        let IdentityDataUpdate {
            name,
            dob,
            ssn,
            address,
        } = update;

        if let Some(name) = name {
            builder.add_full_name(name)?;
        }

        if let Some(dob) = dob {
            builder.add_dob(dob)?;
        }

        if let Some(ssn) = ssn {
            builder.add_ssn(ssn)?;
        }

        if let Some(address) = address {
            builder.add_full_address_or_zip(address)?;
        }

        let (new_identity_data, collected_data) = builder.finish(conn)?;
        // finally create our new fingerprint
        let identity_data = IdentityData::create(conn, new_identity_data)?;

        if !collected_data.is_empty() {
            // Create a timeline event that shows all the new data that was added
            UserTimeline::create(
                conn,
                DataCollectedInfo {
                    attributes: collected_data,
                },
                self.user_vault.id.clone(),
                onboarding_id,
            )?;
        }
        self.identity_data = Some(identity_data);

        Ok(())
    }
}

impl UserVaultWrapper {
    pub fn add_email(
        &mut self,
        conn: &mut TxnPgConnection,
        email: NewtypeEmail,
        fingerprint: Fingerprint,
    ) -> ApiResult<EmailId> {
        self.assert_is_locked(conn)?;
        let email = email.to_piistring();
        let e_data = self.user_vault.public_key.seal_pii(&email)?;
        let priority = if self.email.is_some() {
            DataPriority::Secondary
        } else {
            DataPriority::Primary
        };
        let user_vault_id = self.user_vault.id.clone();
        let email =
            db::models::email::Email::create(conn, user_vault_id, e_data, fingerprint, false, priority)?;
        let email_id = email.id.clone();

        if priority == DataPriority::Primary {
            self.email = Some(email);
        }
        Ok(email_id)
    }

    pub fn missing_fields(&self, ob_config: &ObConfiguration) -> Vec<CollectedDataOption> {
        ob_config
            .must_collect_data
            .iter()
            .filter(|cdo| {
                cdo.attributes()
                    .iter()
                    .filter(|d| d.is_required())
                    .any(|d| !self.has_field(*d))
            })
            .cloned()
            .collect()
    }
}

impl HasDataAttributeFields for UserVaultWrapper {
    fn get_e_field(&self, data_attribute: DataAttribute) -> Option<&SealedVaultBytes> {
        let id = self.identity_data.as_ref();
        let email = self.email.as_ref();
        let phone = self.phone_number.as_ref();
        match data_attribute {
            // identity
            DataAttribute::FirstName => id?.get_e_field(data_attribute),
            DataAttribute::LastName => id?.get_e_field(data_attribute),
            DataAttribute::Dob => id?.get_e_field(data_attribute),
            DataAttribute::Ssn9 => id?.get_e_field(data_attribute),
            DataAttribute::AddressLine1 => id?.get_e_field(data_attribute),
            DataAttribute::AddressLine2 => id?.get_e_field(data_attribute),
            DataAttribute::City => id?.get_e_field(data_attribute),
            DataAttribute::State => id?.get_e_field(data_attribute),
            DataAttribute::Zip => id?.get_e_field(data_attribute),
            DataAttribute::Country => id?.get_e_field(data_attribute),
            DataAttribute::Ssn4 => id?.get_e_field(data_attribute),
            // email
            DataAttribute::Email => email?.get_e_field(data_attribute),
            // phone
            DataAttribute::PhoneNumber => phone?.get_e_field(data_attribute),
            // We need to handle identity document separately since users can have multiple identity documents (for now, there's an open item https://linear.app/footprint/issue/FP-1968/de-chonk-the-identitydocument-dataattribute)
            DataAttribute::IdentityDocument => None,
        }
    }
}
