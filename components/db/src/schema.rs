table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    challenges (id) {
        id -> Uuid,
        user_vault_id -> Varchar,
        sh_data -> Bytea,
        h_code -> Bytea,
        kind -> Challenge_kind,
        state -> Challenge_state,
        expires_at -> Timestamp,
        validated_at -> Nullable<Timestamp>,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    onboarding_session_tokens (h_token) {
        h_token -> Varchar,
        created_at -> Timestamp,
        user_ob_id -> Varchar,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    onboardings (id) {
        id -> Varchar,
        user_ob_id -> Varchar,
        user_vault_id -> Varchar,
        tenant_id -> Varchar,
        status -> User_status,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    tenant_api_keys (tenant_public_key) {
        tenant_public_key -> Varchar,
        sh_secret_api_key -> Bytea,
        e_secret_api_key -> Bytea,
        tenant_id -> Varchar,
        key_name -> Varchar,
        is_enabled -> Bool,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    tenants (id) {
        id -> Varchar,
        name -> Text,
        public_key -> Bytea,
        e_private_key -> Bytea,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    user_vaults (id) {
        id -> Varchar,
        e_private_key -> Bytea,
        public_key -> Bytea,
        e_first_name -> Nullable<Bytea>,
        e_last_name -> Nullable<Bytea>,
        e_dob -> Nullable<Bytea>,
        e_ssn -> Nullable<Bytea>,
        sh_ssn -> Nullable<Bytea>,
        e_street_address -> Nullable<Bytea>,
        e_city -> Nullable<Bytea>,
        e_state -> Nullable<Bytea>,
        e_email -> Nullable<Bytea>,
        sh_email -> Nullable<Bytea>,
        is_email_verified -> Bool,
        e_phone_number -> Nullable<Bytea>,
        sh_phone_number -> Nullable<Bytea>,
        is_phone_number_verified -> Bool,
        id_verified -> User_status,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

joinable!(challenges -> user_vaults (user_vault_id));
joinable!(onboardings -> tenants (tenant_id));
joinable!(onboardings -> user_vaults (user_vault_id));

allow_tables_to_appear_in_same_query!(
    challenges,
    onboarding_session_tokens,
    onboardings,
    tenant_api_keys,
    tenants,
    user_vaults,
);
