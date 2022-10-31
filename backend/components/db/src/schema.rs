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
        reason -> Nullable<Varchar>,
        principal -> Varchar,
        ordering_id -> Int8,
        kind -> Text,
        targets -> Array<Text>,
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
        verification_result_id -> Nullable<Uuid>,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    document_request (id) {
        id -> Text,
        onboarding_id -> Uuid,
        ref_id -> Nullable<Text>,
        status -> Text,
        created_at -> Timestamptz,
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

    identity_document (id) {
        id -> Text,
        request_id -> Text,
        user_vault_id -> Text,
        front_image_s3_url -> Nullable<Text>,
        back_image_s3_url -> Nullable<Text>,
        document_type -> Text,
        country_code -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        e_decryption_key -> Bytea,
        onboarding_id -> Nullable<Uuid>,
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
        must_collect_identity_document -> Bool,
        can_access_identity_document_images -> Bool,
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
        insight_event_id -> Uuid,
        status -> Text,
        is_liveness_skipped -> Bool,
        is_authorized -> Bool,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    onboarding_decision (id) {
        id -> Text,
        onboarding_id -> Uuid,
        logic_git_hash -> Text,
        tenant_user_id -> Nullable<Text>,
        verification_status -> Text,
        compliance_status -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    onboarding_decision_verification_result_junction (id) {
        id -> Uuid,
        verification_result_id -> Uuid,
        onboarding_decision_id -> Text,
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

    requirement (id) {
        id -> Text,
        kind -> Text,
        status -> Text,
        initiator -> Text,
        user_vault_id -> Text,
        fulfilled_at -> Nullable<Timestamptz>,
        fulfilled_by_requirement_id -> Nullable<Text>,
        onboarding_id -> Nullable<Uuid>,
        created_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        error_message -> Nullable<Text>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    requirement_verification_request_junction (id) {
        id -> Uuid,
        verification_request_id -> Uuid,
        requirement_id -> Text,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    risk_signal (id) {
        id -> Text,
        onboarding_decision_id -> Text,
        reason_code -> Text,
        created_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        vendors -> Array<Text>,
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

    tenant_role (id) {
        id -> Text,
        tenant_id -> Text,
        name -> Text,
        permissions -> Jsonb,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        created_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    tenant_user (id) {
        id -> Text,
        tenant_role_id -> Text,
        email -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        created_at -> Timestamptz,
        last_login_at -> Nullable<Timestamptz>,
        tenant_id -> Text,
        deactivated_at -> Nullable<Timestamptz>,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    user_timeline (id) {
        id -> Text,
        onboarding_id -> Nullable<Uuid>,
        event -> Jsonb,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        user_vault_id -> Text,
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
        vendor -> Text,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        email_id -> Nullable<Text>,
        phone_number_id -> Nullable<Text>,
        identity_data_id -> Nullable<Text>,
        onboarding_id -> Uuid,
        identity_document_id -> Nullable<Text>,
        vendor_api -> Text,
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
joinable!(audit_trail -> verification_result (verification_result_id));
joinable!(document_request -> onboarding (onboarding_id));
joinable!(email -> user_vault (user_vault_id));
joinable!(fingerprint -> user_vault (user_vault_id));
joinable!(identity_data -> user_vault (user_vault_id));
joinable!(identity_document -> document_request (request_id));
joinable!(identity_document -> onboarding (onboarding_id));
joinable!(kv_data -> tenant (tenant_id));
joinable!(kv_data -> user_vault (user_vault_id));
joinable!(ob_configuration -> tenant (tenant_id));
joinable!(onboarding -> insight_event (insight_event_id));
joinable!(onboarding -> ob_configuration (ob_configuration_id));
joinable!(onboarding -> scoped_user (scoped_user_id));
joinable!(onboarding_decision -> onboarding (onboarding_id));
joinable!(onboarding_decision -> tenant_user (tenant_user_id));
joinable!(onboarding_decision_verification_result_junction -> onboarding_decision (onboarding_decision_id));
joinable!(onboarding_decision_verification_result_junction -> verification_result (verification_result_id));
joinable!(phone_number -> user_vault (user_vault_id));
joinable!(requirement -> onboarding (onboarding_id));
joinable!(requirement -> user_vault (user_vault_id));
joinable!(requirement_verification_request_junction -> requirement (requirement_id));
joinable!(requirement_verification_request_junction -> verification_request (verification_request_id));
joinable!(risk_signal -> onboarding_decision (onboarding_decision_id));
joinable!(scoped_user -> tenant (tenant_id));
joinable!(scoped_user -> user_vault (user_vault_id));
joinable!(tenant_api_key -> tenant (tenant_id));
joinable!(tenant_api_key_access_log -> tenant_api_key (tenant_api_key_id));
joinable!(tenant_role -> tenant (tenant_id));
joinable!(tenant_user -> tenant (tenant_id));
joinable!(tenant_user -> tenant_role (tenant_role_id));
joinable!(user_timeline -> onboarding (onboarding_id));
joinable!(user_timeline -> user_vault (user_vault_id));
joinable!(verification_request -> email (email_id));
joinable!(verification_request -> identity_data (identity_data_id));
joinable!(verification_request -> identity_document (identity_document_id));
joinable!(verification_request -> onboarding (onboarding_id));
joinable!(verification_request -> phone_number (phone_number_id));
joinable!(verification_result -> verification_request (request_id));
joinable!(webauthn_credential -> insight_event (insight_event_id));
joinable!(webauthn_credential -> user_vault (user_vault_id));

allow_tables_to_appear_in_same_query!(
    access_event,
    audit_trail,
    document_request,
    email,
    fingerprint,
    identity_data,
    identity_document,
    insight_event,
    kv_data,
    ob_configuration,
    onboarding,
    onboarding_decision,
    onboarding_decision_verification_result_junction,
    phone_number,
    requirement,
    requirement_verification_request_junction,
    risk_signal,
    scoped_user,
    session,
    tenant,
    tenant_api_key,
    tenant_api_key_access_log,
    tenant_role,
    tenant_user,
    user_timeline,
    user_vault,
    verification_request,
    verification_result,
    webauthn_credential,
);
