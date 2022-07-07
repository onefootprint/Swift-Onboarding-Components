table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    access_events (id) {
        id -> Uuid,
        onboarding_id -> Text,
        timestamp -> Timestamp,
        _created_at -> Timestamp,
        _updated_at -> Timestamp,
        insight_event_id -> Uuid,
        reason -> Varchar,
        principal -> Nullable<Varchar>,
        data_kinds -> Array<Text>,
        ordering_id -> Int8,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    audit_trails (id) {
        id -> Uuid,
        user_vault_id -> Text,
        tenant_id -> Nullable<Text>,
        event -> Jsonb,
        timestamp -> Timestamp,
        _created_at -> Timestamp,
        _updated_at -> Timestamp,
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
        _created_at -> Timestamp,
        _updated_at -> Timestamp,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    ob_configurations (id) {
        id -> Text,
        key -> Text,
        name -> Varchar,
        description -> Nullable<Varchar>,
        tenant_id -> Text,
        _created_at -> Timestamp,
        _updated_at -> Timestamp,
        required_user_data -> Array<Text>,
        settings -> Jsonb,
        is_disabled -> Bool,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    onboardings (id) {
        id -> Text,
        user_ob_id -> Text,
        user_vault_id -> Text,
        ob_config_id -> Text,
        tenant_id -> Text,
        status -> Text,
        _created_at -> Timestamp,
        _updated_at -> Timestamp,
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
        _created_at -> Timestamp,
        _updated_at -> Timestamp,
        expires_at -> Timestamp,
        sealed_session_data -> Bytea,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    tenant_api_keys (id) {
        id -> Text,
        sh_secret_api_key -> Bytea,
        e_secret_api_key -> Bytea,
        tenant_id -> Text,
        key_name -> Varchar,
        is_enabled -> Bool,
        _created_at -> Timestamp,
        _updated_at -> Timestamp,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    tenants (id) {
        id -> Text,
        name -> Text,
        public_key -> Bytea,
        e_private_key -> Bytea,
        workos_id -> Varchar,
        email_domain -> Varchar,
        _created_at -> Timestamp,
        _updated_at -> Timestamp,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    user_data (id) {
        id -> Text,
        user_vault_id -> Text,
        data_kind -> Text,
        data_group_id -> Uuid,
        data_group_kind -> Text,
        data_group_priority -> Text,
        e_data -> Bytea,
        sh_data -> Nullable<Bytea>,
        is_verified -> Bool,
        deactivated_at -> Nullable<Timestamp>,
        _created_at -> Timestamp,
        _updated_at -> Timestamp,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    user_vaults (id) {
        id -> Text,
        e_private_key -> Bytea,
        public_key -> Bytea,
        id_verified -> Text,
        _created_at -> Timestamp,
        _updated_at -> Timestamp,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    verification_requests (id) {
        id -> Uuid,
        onboarding_id -> Text,
        vendor -> Text,
        timestamp -> Timestamp,
        _created_at -> Timestamp,
        _updated_at -> Timestamp,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    verification_requests_user_data (id) {
        id -> Uuid,
        user_data_id -> Text,
        request_id -> Uuid,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    verification_results (id) {
        id -> Uuid,
        request_id -> Uuid,
        response -> Jsonb,
        timestamp -> Timestamp,
        _created_at -> Timestamp,
        _updated_at -> Timestamp,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    webauthn_credentials (id) {
        id -> Uuid,
        user_vault_id -> Text,
        credential_id -> Bytea,
        public_key -> Bytea,
        counter -> Int4,
        attestation_data -> Bytea,
        _created_at -> Timestamp,
        _updated_at -> Timestamp,
        backup_eligible -> Bool,
        attestation_type -> Text,
        insight_event_id -> Uuid,
    }
}

joinable!(access_events -> insight_events (insight_event_id));
joinable!(access_events -> onboardings (onboarding_id));
joinable!(audit_trails -> tenants (tenant_id));
joinable!(audit_trails -> user_vaults (user_vault_id));
joinable!(ob_configurations -> tenants (tenant_id));
joinable!(onboardings -> insight_events (insight_event_id));
joinable!(onboardings -> ob_configurations (ob_config_id));
joinable!(onboardings -> tenants (tenant_id));
joinable!(onboardings -> user_vaults (user_vault_id));
joinable!(tenant_api_keys -> tenants (tenant_id));
joinable!(user_data -> user_vaults (user_vault_id));
joinable!(verification_requests -> onboardings (onboarding_id));
joinable!(verification_requests_user_data -> user_data (user_data_id));
joinable!(verification_requests_user_data -> verification_requests (request_id));
joinable!(verification_results -> verification_requests (request_id));
joinable!(webauthn_credentials -> insight_events (insight_event_id));
joinable!(webauthn_credentials -> user_vaults (user_vault_id));

allow_tables_to_appear_in_same_query!(
    access_events,
    audit_trails,
    insight_events,
    ob_configurations,
    onboardings,
    sessions,
    tenant_api_keys,
    tenants,
    user_data,
    user_vaults,
    verification_requests,
    verification_requests_user_data,
    verification_results,
    webauthn_credentials,
);
