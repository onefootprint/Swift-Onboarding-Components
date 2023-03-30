use api_wire_types::IdentityDocumentKindForUser;
use db::models::{onboarding::SerializableOnboardingInfo, scoped_vault::ScopedVault};
use newtypes::{DataIdentifier, IdentityDataKind, VaultKind};

use crate::utils::db2api::DbToApi;

pub type UserDetail = (
    Vec<IdentityDataKind>,
    Vec<IdentityDocumentKindForUser>,
    Vec<DataIdentifier>,
    Option<SerializableOnboardingInfo>,
    ScopedVault,
    bool,
    VaultKind,
);

impl DbToApi<UserDetail> for api_wire_types::User {
    fn from_db(
        (
            identity_data_attributes,
            identity_document_types,
            attributes,
            onboarding_info,
            scoped_user,
            is_portable,
            _,
        ): UserDetail,
    ) -> Self {
        let ScopedVault {
            fp_id,
            start_timestamp,
            ordering_id,
            ..
        } = scoped_user;

        api_wire_types::User {
            id: fp_id,
            is_portable,
            identity_data_attributes,
            attributes,
            identity_document_info: identity_document_types,
            start_timestamp,
            onboarding: onboarding_info.map(api_wire_types::Onboarding::from_db),
            ordering_id,
        }
    }
}

impl DbToApi<ScopedVault> for api_wire_types::User {
    fn from_db(target: ScopedVault) -> Self {
        // Used in POST /users when we create a new vault-only user
        let ScopedVault {
            id: _,
            fp_id,
            vault_id: _,
            tenant_id: _,
            _created_at,
            _updated_at,
            ordering_id,
            start_timestamp,
            ..
        } = target;

        Self {
            id: fp_id,
            is_portable: false,
            identity_data_attributes: vec![],
            identity_document_info: vec![],
            attributes: vec![],
            start_timestamp,
            onboarding: None,
            ordering_id,
        }
    }
}
