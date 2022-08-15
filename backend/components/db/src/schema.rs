table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    access_events (id) {
        id -> Uuid,
        scoped_user_id -> Text,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
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

    address (id) {
        id -> Text,
        user_vault_id -> Text,
        fingerprint_ids -> Array<Uuid>,
        e_line1 -> Nullable<Bytea>,
        e_line2 -> Nullable<Bytea>,
        e_city -> Nullable<Bytea>,
        e_state -> Nullable<Bytea>,
        e_zip -> Nullable<Bytea>,
        e_country -> Nullable<Bytea>,
        deactivated_at -> Nullable<Timestamptz>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
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
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    email (id) {
        id -> Text,
        user_vault_id -> Text,
        fingerprint_ids -> Array<Uuid>,
        e_data -> Bytea,
        is_verified -> Bool,
        priority -> Text,
        deactivated_at -> Nullable<Timestamptz>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    fingerprint (id) {
        id -> Uuid,
        user_vault_id -> Text,
        sh_data -> Bytea,
        deactivated_at -> Nullable<Timestamptz>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    insight_events (id) {
        id -> Uuid,
        timestamp -> Timestamptz,
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
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    ob_configurations (id) {
        id -> Text,
        key -> Text,
        name -> Varchar,
        tenant_id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        must_collect_data_kinds -> Array<Text>,
        can_access_data_kinds -> Array<Text>,
        is_live -> Bool,
        status -> Text,
        created_at -> Timestamptz,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    onboardings (id) {
        id -> Uuid,
        scoped_user_id -> Text,
        ob_configuration_id -> Text,
        start_timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        status -> Text,
        insight_event_id -> Uuid,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    phone_number (id) {
        id -> Text,
        user_vault_id -> Text,
        fingerprint_ids -> Array<Uuid>,
        e_e164 -> Bytea,
        e_country -> Bytea,
        is_verified -> Bool,
        priority -> Text,
        deactivated_at -> Nullable<Timestamptz>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    scoped_users (id) {
        id -> Text,
        fp_user_id -> Text,
        user_vault_id -> Text,
        tenant_id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        ordering_id -> Int8,
        start_timestamp -> Timestamptz,
        is_live -> Bool,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    sessions (key) {
        key -> Varchar,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        expires_at -> Timestamptz,
        data -> Bytea,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    tenant_api_key_access_logs (id) {
        id -> Uuid,
        tenant_api_key_id -> Text,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
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
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        is_live -> Bool,
        status -> Text,
        name -> Text,
        created_at -> Timestamptz,
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
        workos_id -> Nullable<Varchar>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        logo_url -> Nullable<Text>,
        workos_admin_profile_id -> Nullable<Text>,
        sandbox_restricted -> Bool,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    user_profile (id) {
        id -> Text,
        user_vault_id -> Text,
        fingerprint_ids -> Array<Uuid>,
        e_first_name -> Nullable<Bytea>,
        e_last_name -> Nullable<Bytea>,
        e_dob -> Nullable<Bytea>,
        e_ssn9 -> Nullable<Bytea>,
        e_ssn4 -> Nullable<Bytea>,
        deactivated_at -> Nullable<Timestamptz>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    user_vaults (id) {
        id -> Text,
        e_private_key -> Bytea,
        public_key -> Bytea,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        is_live -> Bool,
        is_portable -> Bool,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    verification_requests (id) {
        id -> Uuid,
        scoped_user_id -> Text,
        vendor -> Text,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
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
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
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
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        backup_eligible -> Bool,
        attestation_type -> Text,
        insight_event_id -> Uuid,
    }
}

joinable!(access_events -> insight_events (insight_event_id));
joinable!(access_events -> scoped_users (scoped_user_id));
joinable!(address -> user_vaults (user_vault_id));
joinable!(audit_trails -> tenants (tenant_id));
joinable!(audit_trails -> user_vaults (user_vault_id));
joinable!(email -> user_vaults (user_vault_id));
joinable!(fingerprint -> user_vaults (user_vault_id));
joinable!(ob_configurations -> tenants (tenant_id));
joinable!(onboardings -> insight_events (insight_event_id));
joinable!(onboardings -> ob_configurations (ob_configuration_id));
joinable!(onboardings -> scoped_users (scoped_user_id));
joinable!(phone_number -> user_vaults (user_vault_id));
joinable!(scoped_users -> tenants (tenant_id));
joinable!(scoped_users -> user_vaults (user_vault_id));
joinable!(tenant_api_key_access_logs -> tenant_api_keys (tenant_api_key_id));
joinable!(tenant_api_keys -> tenants (tenant_id));
joinable!(user_profile -> user_vaults (user_vault_id));
joinable!(verification_requests -> scoped_users (scoped_user_id));
joinable!(verification_requests_user_data -> verification_requests (request_id));
joinable!(verification_results -> verification_requests (request_id));
joinable!(webauthn_credentials -> insight_events (insight_event_id));
joinable!(webauthn_credentials -> user_vaults (user_vault_id));

allow_tables_to_appear_in_same_query!(
    access_events,
    address,
    audit_trails,
    email,
    fingerprint,
    insight_events,
    ob_configurations,
    onboardings,
    phone_number,
    scoped_users,
    sessions,
    tenant_api_key_access_logs,
    tenant_api_keys,
    tenants,
    user_profile,
    user_vaults,
    verification_requests,
    verification_requests_user_data,
    verification_results,
    webauthn_credentials,
);
