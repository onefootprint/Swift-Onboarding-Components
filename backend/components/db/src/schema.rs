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
        portablized_at -> Nullable<Timestamptz>,
        deactivated_at -> Nullable<Timestamptz>,
        created_seqno -> Int8,
        portablized_seqno -> Nullable<Int8>,
        deactivated_seqno -> Nullable<Int8>,
        kind -> Text,
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
        should_collect_selfie -> Bool,
        idv_reqs_initiated -> Bool,
        previous_document_request_id -> Nullable<Text>,
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
        is_unique -> Bool,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    fingerprint_visit_event (id) {
        id -> Text,
        visitor_id -> Text,
        user_vault_id -> Nullable<Text>,
        scoped_user_id -> Nullable<Text>,
        path -> Text,
        session_id -> Nullable<Text>,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        request_id -> Text,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    identity_document (id) {
        id -> Text,
        request_id -> Text,
        front_image_s3_url -> Nullable<Text>,
        back_image_s3_url -> Nullable<Text>,
        document_type -> Text,
        country_code -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        e_data_key -> Bytea,
        lifetime_id -> Text,
        selfie_image_s3_url -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    idology_expect_id_response (id) {
        id -> Text,
        verification_result_id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        id_number -> Nullable<Int8>,
        id_scan -> Nullable<Text>,
        error -> Nullable<Text>,
        results -> Nullable<Text>,
        summary_result -> Nullable<Text>,
        qualifiers -> Array<Text>,
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
        data_key -> Text,
        e_data -> Bytea,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        lifetime_id -> Text,
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
        must_collect_selfie -> Bool,
        can_access_selfie_image -> Bool,
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
        has_final_decision -> Bool,
        authorized_at -> Nullable<Timestamptz>,
        idv_reqs_initiated_at -> Nullable<Timestamptz>,
        decision_made_at -> Nullable<Timestamptz>,
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
        is_verified -> Bool,
        priority -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        lifetime_id -> Text,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    proxy_config (id) {
        id -> Text,
        tenant_id -> Text,
        is_live -> Bool,
        name -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        url -> Text,
        method -> Text,
        client_identity_cert_der -> Nullable<Bytea>,
        e_client_identity_key_der -> Nullable<Bytea>,
        ingress_content_type -> Nullable<Text>,
        access_reason -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    proxy_config_header (id) {
        id -> Text,
        config_id -> Text,
        name -> Text,
        value -> Text,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    proxy_config_ingress_rule (id) {
        id -> Text,
        config_id -> Text,
        token_path -> Text,
        target -> Text,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    proxy_config_secret_header (id) {
        id -> Text,
        config_id -> Text,
        name -> Text,
        e_data -> Bytea,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    proxy_config_server_cert (id) {
        id -> Text,
        config_id -> Text,
        cert_hash -> Bytea,
        cert_der -> Bytea,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    proxy_request_log (id) {
        id -> Text,
        tenant_id -> Text,
        config_id -> Nullable<Text>,
        e_url -> Bytea,
        method -> Text,
        sent_at -> Timestamptz,
        received_at -> Nullable<Timestamptz>,
        status_code -> Nullable<Int4>,
        e_request_data -> Bytea,
        e_response_data -> Nullable<Bytea>,
        request_error -> Nullable<Text>,
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
        ob_configuration_id -> Nullable<Text>,
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

    socure_device_session (id) {
        id -> Text,
        onboarding_id -> Text,
        device_session_id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
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
        website_url -> Nullable<Text>,
        company_size -> Nullable<Text>,
        privacy_policy_url -> Nullable<Text>,
        stripe_customer_id -> Nullable<Text>,
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
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        created_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        is_immutable -> Bool,
        scopes -> Array<Text>,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    tenant_rolebinding (id) {
        id -> Text,
        tenant_user_id -> Text,
        tenant_role_id -> Text,
        tenant_id -> Text,
        last_login_at -> Nullable<Timestamptz>,
        deactivated_at -> Nullable<Timestamptz>,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    tenant_user (id) {
        id -> Text,
        email -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        created_at -> Timestamptz,
        first_name -> Nullable<Text>,
        last_name -> Nullable<Text>,
        is_firm_employee -> Bool,
    }
}

table! {
    use diesel::sql_types::*;
    use newtypes::db_types::*;

    user_consent (id) {
        id -> Text,
        timestamp -> Timestamptz,
        insight_event_id -> Text,
        consent_language_text -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        onboarding_id -> Text,
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
        is_portable -> Bool,
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
        identity_document_id -> Nullable<Text>,
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
        e_response -> Nullable<Bytea>,
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
        backup_state -> Bool,
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
joinable!(fingerprint_visit_event -> scoped_user (scoped_user_id));
joinable!(fingerprint_visit_event -> user_vault (user_vault_id));
joinable!(identity_document -> data_lifetime (lifetime_id));
joinable!(identity_document -> document_request (request_id));
joinable!(idology_expect_id_response -> verification_result (verification_result_id));
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
joinable!(proxy_config -> tenant (tenant_id));
joinable!(proxy_config_header -> proxy_config (config_id));
joinable!(proxy_config_ingress_rule -> proxy_config (config_id));
joinable!(proxy_config_secret_header -> proxy_config (config_id));
joinable!(proxy_config_server_cert -> proxy_config (config_id));
joinable!(proxy_request_log -> proxy_config (config_id));
joinable!(proxy_request_log -> tenant (tenant_id));
joinable!(risk_signal -> onboarding_decision (onboarding_decision_id));
joinable!(scoped_user -> ob_configuration (ob_configuration_id));
joinable!(scoped_user -> tenant (tenant_id));
joinable!(scoped_user -> user_vault (user_vault_id));
joinable!(socure_device_session -> onboarding (onboarding_id));
joinable!(tenant_api_key -> tenant (tenant_id));
joinable!(tenant_api_key_access_log -> tenant_api_key (tenant_api_key_id));
joinable!(tenant_role -> tenant (tenant_id));
joinable!(tenant_rolebinding -> tenant (tenant_id));
joinable!(tenant_rolebinding -> tenant_role (tenant_role_id));
joinable!(tenant_rolebinding -> tenant_user (tenant_user_id));
joinable!(user_consent -> insight_event (insight_event_id));
joinable!(user_consent -> onboarding (onboarding_id));
joinable!(user_timeline -> scoped_user (scoped_user_id));
joinable!(user_timeline -> user_vault (user_vault_id));
joinable!(verification_request -> identity_document (identity_document_id));
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
    fingerprint_visit_event,
    identity_document,
    idology_expect_id_response,
    insight_event,
    kv_data,
    liveness_event,
    manual_review,
    ob_configuration,
    onboarding,
    onboarding_decision,
    onboarding_decision_verification_result_junction,
    phone_number,
    proxy_config,
    proxy_config_header,
    proxy_config_ingress_rule,
    proxy_config_secret_header,
    proxy_config_server_cert,
    proxy_request_log,
    risk_signal,
    scoped_user,
    session,
    socure_device_session,
    tenant,
    tenant_api_key,
    tenant_api_key_access_log,
    tenant_role,
    tenant_rolebinding,
    tenant_user,
    user_consent,
    user_timeline,
    user_vault,
    user_vault_data,
    verification_request,
    verification_result,
    webauthn_credential,
);
