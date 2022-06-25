table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    access_events (id) {
        id -> Uuid,
        onboarding_id -> Varchar,
        timestamp -> Timestamp,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        insight_event_id -> Uuid,
        reason -> Varchar,
        principal -> Nullable<Varchar>,
        data_kinds -> Array<Data_kind>,
        ordering_id -> Int8,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    insight_events (id) {
        id -> Uuid,
        timestamp -> Timestamp,
        ip_address -> Nullable<Varchar>,
        country -> Nullable<Varchar>,
        region -> Nullable<Varchar>,
        region_name -> Nullable<Varchar>,
        latitude -> Nullable<Float8>,
        longitude -> Nullable<Float8>,
        metro_code -> Nullable<Varchar>,
        postal_code -> Nullable<Varchar>,
        time_zone -> Nullable<Varchar>,
        user_agent -> Nullable<Varchar>,
        city -> Nullable<Varchar>,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    ob_configurations (id) {
        id -> Varchar,
        key -> Varchar,
        name -> Varchar,
        description -> Nullable<Varchar>,
        tenant_id -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        required_user_data -> Array<Data_kind>,
        settings -> Jsonb,
        is_disabled -> Bool,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    onboardings (id) {
        id -> Varchar,
        user_ob_id -> Varchar,
        user_vault_id -> Varchar,
        ob_config_id -> Varchar,
        tenant_id -> Varchar,
        status -> User_status,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        insight_event_id -> Uuid,
        ordering_id -> Int8,
        start_timestamp -> Timestamp,
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
        sealed_session_data -> Bytea,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    tenant_api_keys (id) {
        id -> Varchar,
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
        workos_id -> Varchar,
        email_domain -> Varchar,
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
        sh_data -> Nullable<Bytea>,
        is_verified -> Bool,
        data_priority -> Data_priority,
        deactivated_at -> Nullable<Timestamp>,
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
        backup_eligible -> Bool,
        attestation_type -> Attestation_type,
        insight_event_id -> Uuid,
    }
}

joinable!(access_events -> onboardings (onboarding_id));
joinable!(onboardings -> ob_configurations (ob_config_id));
joinable!(onboardings -> user_vaults (user_vault_id));
joinable!(user_data -> user_vaults (user_vault_id));
joinable!(webauthn_credentials -> user_vaults (user_vault_id));

allow_tables_to_appear_in_same_query!(
    access_events,
    insight_events,
    ob_configurations,
    onboardings,
    sessions,
    tenant_api_keys,
    tenants,
    user_data,
    user_vaults,
    webauthn_credentials,
);
