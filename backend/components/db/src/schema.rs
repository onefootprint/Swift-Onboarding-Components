table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    access_event (id) {
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

    audit_trail (id) {
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
        data_attribute -> Text,
        is_unique -> Bool,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    identity_data (id) {
        id -> Text,
        user_vault_id -> Text,
        fingerprint_ids -> Array<Uuid>,
        e_first_name -> Nullable<Bytea>,
        e_last_name -> Nullable<Bytea>,
        e_dob -> Nullable<Bytea>,
        e_ssn9 -> Nullable<Bytea>,
        e_ssn4 -> Nullable<Bytea>,
        e_address_line1 -> Nullable<Bytea>,
        e_address_line2 -> Nullable<Bytea>,
        e_address_city -> Nullable<Bytea>,
        e_address_state -> Nullable<Bytea>,
        e_address_zip -> Nullable<Bytea>,
        e_address_country -> Nullable<Bytea>,
        deactivated_at -> Nullable<Timestamptz>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    insight_event (id) {
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

    kv_data (id) {
        id -> Text,
        user_vault_id -> Text,
        tenant_id -> Text,
        data_key -> Text,
        e_data -> Bytea,
        deactivated_at -> Nullable<Timestamptz>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    ob_configuration (id) {
        id -> Text,
        key -> Text,
        name -> Varchar,
        tenant_id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        is_live -> Bool,
        status -> Text,
        created_at -> Timestamptz,
        must_collect_data -> Array<Text>,
        can_access_data -> Array<Text>,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    onboarding (id) {
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

    scoped_user (id) {
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

    session (key) {
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

    tenant (id) {
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

    tenant_api_key (id) {
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

    tenant_api_key_access_log (id) {
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

    user_vault (id) {
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

    verification_request (id) {
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

    verification_request_user_data (id) {
        id -> Uuid,
        user_data_id -> Text,
        request_id -> Uuid,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    verification_result (id) {
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

    webauthn_credential (id) {
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

joinable!(access_event -> insight_event (insight_event_id));
joinable!(access_event -> scoped_user (scoped_user_id));
joinable!(audit_trail -> tenant (tenant_id));
joinable!(audit_trail -> user_vault (user_vault_id));
joinable!(email -> user_vault (user_vault_id));
joinable!(fingerprint -> user_vault (user_vault_id));
joinable!(identity_data -> user_vault (user_vault_id));
joinable!(kv_data -> tenant (tenant_id));
joinable!(kv_data -> user_vault (user_vault_id));
joinable!(ob_configuration -> tenant (tenant_id));
joinable!(onboarding -> insight_event (insight_event_id));
joinable!(onboarding -> ob_configuration (ob_configuration_id));
joinable!(onboarding -> scoped_user (scoped_user_id));
joinable!(phone_number -> user_vault (user_vault_id));
joinable!(scoped_user -> tenant (tenant_id));
joinable!(scoped_user -> user_vault (user_vault_id));
joinable!(tenant_api_key -> tenant (tenant_id));
joinable!(tenant_api_key_access_log -> tenant_api_key (tenant_api_key_id));
joinable!(verification_request -> scoped_user (scoped_user_id));
joinable!(verification_request_user_data -> verification_request (request_id));
joinable!(verification_result -> verification_request (request_id));
joinable!(webauthn_credential -> insight_event (insight_event_id));
joinable!(webauthn_credential -> user_vault (user_vault_id));

allow_tables_to_appear_in_same_query!(
    access_event,
    audit_trail,
    email,
    fingerprint,
    identity_data,
    insight_event,
    kv_data,
    ob_configuration,
    onboarding,
    phone_number,
    scoped_user,
    session,
    tenant,
    tenant_api_key,
    tenant_api_key_access_log,
    user_vault,
    verification_request,
    verification_request_user_data,
    verification_result,
    webauthn_credential,
);
