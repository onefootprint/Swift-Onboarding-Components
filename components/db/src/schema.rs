table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    access_events (id) {
        id -> Uuid,
        onboarding_id -> Varchar,
        data_kind -> Data_kind,
        timestamp -> Timestamp,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

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
    use newtypes::db_types::*;

    sessions (h_session_id) {
        h_session_id -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        expires_at -> Timestamp,
        session_data -> Jsonb,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

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
    use newtypes::db_types::*;

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
    use newtypes::db_types::*;

    user_data (id) {
        id -> Varchar,
        user_vault_id -> Varchar,
        data_kind -> Data_kind,
        e_data -> Bytea,
        sh_data -> Bytea,
        is_verified -> Bool,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

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
        e_phone_number -> Bytea,
        sh_phone_number -> Bytea,
        id_verified -> User_status,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    webauthn_credentials (id) {
        id -> Uuid,
        user_vault_id -> Varchar,
        credential_id -> Bytea,
        public_key -> Bytea,
        counter -> Int4,
        attestation_data -> Bytea,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

joinable!(access_events -> onboardings (onboarding_id));
joinable!(onboardings -> tenants (tenant_id));
joinable!(onboardings -> user_vaults (user_vault_id));
joinable!(user_data -> user_vaults (user_vault_id));
joinable!(webauthn_credentials -> user_vaults (user_vault_id));

allow_tables_to_appear_in_same_query!(
    access_events,
    onboardings,
    sessions,
    tenant_api_keys,
    tenants,
    user_data,
    user_vaults,
    webauthn_credentials,
);
