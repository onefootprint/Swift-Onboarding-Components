table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    access_event (id) {
        id -> Text,
        scoped_user_id -> Text,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        insight_event_id -> Text,
        reason -> Nullable<Varchar>,
        principal -> Jsonb,
        ordering_id -> Int8,
        kind -> Text,
        targets -> Array<Text>,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    annotation (id) {
        id -> Text,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        scoped_user_id -> Text,
        note -> Text,
        is_pinned -> Bool,
        actor -> Jsonb,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    data_lifetime (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        user_vault_id -> Text,
        scoped_user_id -> Nullable<Text>,
        created_at -> Timestamptz,
        committed_at -> Nullable<Timestamptz>,
        deactivated_at -> Nullable<Timestamptz>,
        created_seqno -> Int8,
        committed_seqno -> Nullable<Int8>,
        deactivated_seqno -> Nullable<Int8>,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    document_request (id) {
        id -> Text,
        scoped_user_id -> Text,
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
        e_data -> Bytea,
        is_verified -> Bool,
        priority -> Text,
        deactivated_at -> Nullable<Timestamptz>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        lifetime_id -> Text,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    fingerprint (id) {
        id -> Text,
        sh_data -> Bytea,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        kind -> Text,
        lifetime_id -> Text,
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
        scoped_user_id -> Nullable<Text>,
        e_data_key -> Bytea,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    insight_event (id) {
        id -> Text,
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
        is_android_user -> Nullable<Bool>,
        is_desktop_viewer -> Nullable<Bool>,
        is_ios_viewer -> Nullable<Bool>,
        is_mobile_viewer -> Nullable<Bool>,
        is_smarttv_viewer -> Nullable<Bool>,
        is_tablet_viewer -> Nullable<Bool>,
        asn -> Nullable<Text>,
        country_code -> Nullable<Text>,
        forwarded_proto -> Nullable<Text>,
        http_version -> Nullable<Text>,
        tls -> Nullable<Text>,
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

    liveness_event (id) {
        id -> Text,
        scoped_user_id -> Text,
        liveness_source -> Text,
        attributes -> Nullable<Jsonb>,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        insight_event_id -> Text,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    manual_review (id) {
        id -> Text,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        onboarding_id -> Text,
        completed_at -> Nullable<Timestamptz>,
        completed_by_decision_id -> Nullable<Text>,
        completed_by_actor -> Nullable<Jsonb>,
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
        id -> Text,
        scoped_user_id -> Text,
        ob_configuration_id -> Text,
        start_timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        insight_event_id -> Text,
        is_authorized -> Bool,
        idv_reqs_initiated -> Bool,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    onboarding_decision (id) {
        id -> Text,
        onboarding_id -> Text,
        logic_git_hash -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        status -> Text,
        actor -> Jsonb,
        seqno -> Nullable<Int8>,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    onboarding_decision_verification_result_junction (id) {
        id -> Text,
        verification_result_id -> Text,
        onboarding_decision_id -> Text,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    phone_number (id) {
        id -> Text,
        e_e164 -> Bytea,
        e_country -> Bytea,
        is_verified -> Bool,
        priority -> Text,
        deactivated_at -> Nullable<Timestamptz>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        lifetime_id -> Text,
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
        id -> Text,
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
        first_name -> Nullable<Text>,
        last_name -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    user_timeline (id) {
        id -> Text,
        scoped_user_id -> Nullable<Text>,
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

    user_vault_data (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        lifetime_id -> Text,
        kind -> Text,
        e_data -> Bytea,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    verification_request (id) {
        id -> Text,
        vendor -> Text,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        onboarding_id -> Text,
        vendor_api -> Text,
        uvw_snapshot_seqno -> Int8,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    verification_result (id) {
        id -> Text,
        request_id -> Text,
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
        id -> Text,
        user_vault_id -> Text,
        credential_id -> Bytea,
        public_key -> Bytea,
        counter -> Int4,
        attestation_data -> Bytea,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        backup_eligible -> Bool,
        attestation_type -> Text,
        insight_event_id -> Text,
    }
}

joinable!(access_event -> insight_event (insight_event_id));
joinable!(access_event -> scoped_user (scoped_user_id));
joinable!(annotation -> scoped_user (scoped_user_id));
joinable!(data_lifetime -> scoped_user (scoped_user_id));
joinable!(data_lifetime -> user_vault (user_vault_id));
joinable!(document_request -> scoped_user (scoped_user_id));
joinable!(email -> data_lifetime (lifetime_id));
joinable!(fingerprint -> data_lifetime (lifetime_id));
joinable!(identity_document -> document_request (request_id));
joinable!(identity_document -> scoped_user (scoped_user_id));
joinable!(kv_data -> tenant (tenant_id));
joinable!(kv_data -> user_vault (user_vault_id));
joinable!(liveness_event -> insight_event (insight_event_id));
joinable!(liveness_event -> scoped_user (scoped_user_id));
joinable!(manual_review -> onboarding (onboarding_id));
joinable!(manual_review -> onboarding_decision (completed_by_decision_id));
joinable!(ob_configuration -> tenant (tenant_id));
joinable!(onboarding -> insight_event (insight_event_id));
joinable!(onboarding -> ob_configuration (ob_configuration_id));
joinable!(onboarding -> scoped_user (scoped_user_id));
joinable!(onboarding_decision -> onboarding (onboarding_id));
joinable!(onboarding_decision_verification_result_junction -> onboarding_decision (onboarding_decision_id));
joinable!(onboarding_decision_verification_result_junction -> verification_result (verification_result_id));
joinable!(phone_number -> data_lifetime (lifetime_id));
joinable!(risk_signal -> onboarding_decision (onboarding_decision_id));
joinable!(scoped_user -> tenant (tenant_id));
joinable!(scoped_user -> user_vault (user_vault_id));
joinable!(tenant_api_key -> tenant (tenant_id));
joinable!(tenant_api_key_access_log -> tenant_api_key (tenant_api_key_id));
joinable!(tenant_role -> tenant (tenant_id));
joinable!(tenant_user -> tenant (tenant_id));
joinable!(tenant_user -> tenant_role (tenant_role_id));
joinable!(user_timeline -> scoped_user (scoped_user_id));
joinable!(user_timeline -> user_vault (user_vault_id));
joinable!(user_vault_data -> data_lifetime (lifetime_id));
joinable!(verification_request -> onboarding (onboarding_id));
joinable!(verification_result -> verification_request (request_id));
joinable!(webauthn_credential -> insight_event (insight_event_id));
joinable!(webauthn_credential -> user_vault (user_vault_id));

allow_tables_to_appear_in_same_query!(
    access_event,
    annotation,
    data_lifetime,
    document_request,
    email,
    fingerprint,
    identity_document,
    insight_event,
    kv_data,
    liveness_event,
    manual_review,
    ob_configuration,
    onboarding,
    onboarding_decision,
    onboarding_decision_verification_result_junction,
    phone_number,
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
    user_vault_data,
    verification_request,
    verification_result,
    webauthn_credential,
);
