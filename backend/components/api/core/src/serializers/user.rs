use std::collections::HashMap;

use db::models::{onboarding::SerializableOnboardingInfo, scoped_vault::ScopedVault};
use newtypes::{DataIdentifier, PiiString, VaultKind};

use crate::utils::db2api::DbToApi;

pub type UserDetail = (
    Vec<DataIdentifier>,
    Option<SerializableOnboardingInfo>,
    ScopedVault,
    bool,
    VaultKind,
    HashMap<DataIdentifier, PiiString>,
);

impl DbToApi<UserDetail> for api_wire_types::User {
    fn from_db(
        (
            attributes,
            onboarding_info,
            scoped_user,
            is_portable,
            _,
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
            attributes,
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
            attributes: vec![],
            start_timestamp,
            onboarding: None,
            ordering_id,
        }
    }
}
