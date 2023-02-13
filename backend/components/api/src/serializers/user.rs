use api_wire_types::IdentityDocumentKindForUser;
use db::models::{onboarding::SerializableOnboardingInfo, scoped_user::ScopedUser};
use newtypes::{DataIdentifier, IdentityDataKind};

use crate::utils::db2api::DbToApi;

pub type UserDetail = (
    Vec<IdentityDataKind>,
    Vec<IdentityDocumentKindForUser>,
    Vec<DataIdentifier>,
    Option<SerializableOnboardingInfo>,
    ScopedUser,
    bool,
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
        ): UserDetail,
    ) -> Self {
        let ScopedUser {
            fp_user_id,
            start_timestamp,
            ordering_id,
            ..
        } = scoped_user;

        api_wire_types::User {
            id: fp_user_id,
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

impl DbToApi<ScopedUser> for api_wire_types::User {
    fn from_db(target: ScopedUser) -> Self {
        // Used in POST /users when we create a new vault-only user
        let ScopedUser {
            id: _,
            fp_user_id,
            user_vault_id: _,
            tenant_id: _,
            _created_at,
            _updated_at,
            ordering_id,
            start_timestamp,
            ..
        } = target;

        Self {
            id: fp_user_id,
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
