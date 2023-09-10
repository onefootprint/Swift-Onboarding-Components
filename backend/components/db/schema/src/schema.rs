table! {
    use diesel::sql_types::*;

    access_event (id) {
        id -> Text,
        scoped_vault_id -> Text,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        insight_event_id -> Text,
        reason -> Nullable<Varchar>,
        principal -> Jsonb,
        ordering_id -> Int8,
        kind -> Text,
        targets -> Array<Text>,
        tenant_id -> Text,
        is_live -> Bool,
        purpose -> Text,
    }
}

table! {
    use diesel::sql_types::*;

    annotation (id) {
        id -> Text,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        scoped_vault_id -> Text,
        note -> Text,
        is_pinned -> Bool,
        actor -> Jsonb,
    }
}

table! {
    use diesel::sql_types::*;

    appearance (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        tenant_id -> Text,
        data -> Jsonb,
    }
}

table! {
    use diesel::sql_types::*;

    apple_device_attestation (id) {
        id -> Text,
        vault_id -> Text,
        metadata -> Jsonb,
        receipt -> Bytea,
        raw_attestation -> Bytea,
        is_development -> Bool,
        attested_key_id -> Bytea,
        attested_public_key -> Bytea,
        receipt_type -> Text,
        receipt_risk_metric -> Nullable<Int4>,
        receipt_expiration -> Timestamptz,
        receipt_creation -> Timestamptz,
        receipt_not_before -> Nullable<Timestamptz>,
        dc_token -> Nullable<Text>,
        dc_bit0 -> Nullable<Bool>,
        dc_bit1 -> Nullable<Bool>,
        dc_last_updated -> Nullable<Text>,
        created_at -> Timestamptz,
        bundle_id -> Text,
        webauthn_credential_id -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;

    auth_event (id) {
        id -> Text,
        vault_id -> Text,
        scoped_vault_id -> Nullable<Text>,
        insight_event_id -> Nullable<Text>,
        kind -> Text,
        webauthn_credential_id -> Nullable<Text>,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

table! {
    use diesel::sql_types::*;

    billing_profile (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        tenant_id -> Text,
        kyc -> Nullable<Text>,
        kyb -> Nullable<Text>,
        pii -> Nullable<Text>,
        id_docs -> Nullable<Text>,
        watchlist -> Nullable<Text>,
        hot_vaults -> Nullable<Text>,
        hot_proxy_vaults -> Nullable<Text>,
        vaults_with_non_pci -> Nullable<Text>,
        vaults_with_pci -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;

    business_owner (id) {
        id -> Text,
        user_vault_id -> Nullable<Text>,
        business_vault_id -> Text,
        kind -> Text,
        link_id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

table! {
    use diesel::sql_types::*;

    contact_info (id) {
        id -> Text,
        is_verified -> Bool,
        priority -> Text,
        lifetime_id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        is_otp_verified -> Bool,
    }
}

table! {
    use diesel::sql_types::*;

    custom_migration (version) {
        version -> Text,
        run_on -> Timestamptz,
    }
}

table! {
    use diesel::sql_types::*;

    data_lifetime (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        vault_id -> Text,
        scoped_vault_id -> Text,
        created_at -> Timestamptz,
        portablized_at -> Nullable<Timestamptz>,
        deactivated_at -> Nullable<Timestamptz>,
        created_seqno -> Int8,
        portablized_seqno -> Nullable<Int8>,
        deactivated_seqno -> Nullable<Int8>,
        kind -> Text,
        source -> Text,
    }
}

table! {
    use diesel::sql_types::*;

    decision_intent (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        created_at -> Timestamptz,
        kind -> Text,
        scoped_vault_id -> Text,
        workflow_id -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;

    document_data (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        lifetime_id -> Text,
        kind -> Text,
        mime_type -> Text,
        filename -> Text,
        s3_url -> Text,
        e_data_key -> Bytea,
    }
}

table! {
    use diesel::sql_types::*;

    document_request (id) {
        id -> Text,
        scoped_vault_id -> Text,
        ref_id -> Nullable<Text>,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        should_collect_selfie -> Bool,
        workflow_id -> Text,
        global_doc_types_accepted -> Nullable<Array<Text>>,
        country_restrictions -> Nullable<Array<Text>>,
        country_doc_type_restrictions -> Nullable<Jsonb>,
    }
}

table! {
    use diesel::sql_types::*;

    document_upload (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        document_id -> Text,
        side -> Text,
        s3_url -> Text,
        e_data_key -> Bytea,
        created_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        created_seqno -> Int8,
        failure_reasons -> Array<Text>,
    }
}

table! {
    use diesel::sql_types::*;

    fingerprint (id) {
        id -> Text,
        sh_data -> Bytea,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        kind -> Text,
        lifetime_id -> Text,
        is_unique -> Bool,
        version -> Text,
        scope -> Text,
    }
}

table! {
    use diesel::sql_types::*;

    fingerprint_visit_event (id) {
        id -> Text,
        visitor_id -> Text,
        vault_id -> Nullable<Text>,
        scoped_vault_id -> Nullable<Text>,
        path -> Text,
        session_id -> Nullable<Text>,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        request_id -> Text,
        response -> Nullable<Jsonb>,
    }
}

table! {
    use diesel::sql_types::*;

    google_device_attestation (id) {
        id -> Text,
        vault_id -> Text,
        metadata -> Jsonb,
        created_at -> Timestamptz,
        raw_token -> Text,
        raw_claims -> Jsonb,
        package_name -> Text,
        app_version -> Nullable<Text>,
        webauthn_credential_id -> Nullable<Text>,
        widevine_id -> Nullable<Text>,
        widevine_security_level -> Nullable<Text>,
        android_id -> Nullable<Text>,
        is_trustworthy_device -> Bool,
        is_evaluated_device -> Bool,
        license_verdict -> Text,
        recognition_verdict -> Text,
        integrity_level -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

table! {
    use diesel::sql_types::*;

    identity_document (id) {
        id -> Text,
        request_id -> Text,
        document_type -> Text,
        country_code -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        front_lifetime_id -> Nullable<Text>,
        back_lifetime_id -> Nullable<Text>,
        selfie_lifetime_id -> Nullable<Text>,
        completed_seqno -> Nullable<Int8>,
        document_score -> Nullable<Float8>,
        selfie_score -> Nullable<Float8>,
        ocr_confidence_score -> Nullable<Float8>,
        status -> Text,
        fixture_result -> Nullable<Text>,
        skip_selfie -> Nullable<Bool>,
        device_type -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;

    identity_document_backup (id) {
        id -> Text,
        request_id -> Nullable<Text>,
        front_image_s3_url -> Nullable<Text>,
        back_image_s3_url -> Nullable<Text>,
        document_type -> Nullable<Text>,
        country_code -> Nullable<Text>,
        created_at -> Nullable<Timestamptz>,
        _created_at -> Nullable<Timestamptz>,
        _updated_at -> Nullable<Timestamptz>,
        e_data_key -> Nullable<Bytea>,
        lifetime_id -> Nullable<Text>,
        selfie_image_s3_url -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;

    incode_verification_session (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        created_at -> Timestamptz,
        incode_session_id -> Nullable<Text>,
        incode_configuration_id -> Text,
        incode_authentication_token -> Nullable<Text>,
        incode_authentication_token_expires_at -> Nullable<Timestamptz>,
        identity_document_id -> Text,
        state -> Text,
        completed_at -> Nullable<Timestamptz>,
        kind -> Text,
        latest_failure_reasons -> Array<Text>,
    }
}

table! {
    use diesel::sql_types::*;

    incode_verification_session_event (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        created_at -> Timestamptz,
        incode_verification_session_id -> Text,
        incode_verification_session_state -> Text,
        identity_document_id -> Text,
        kind -> Text,
        latest_failure_reasons -> Array<Text>,
    }
}

table! {
    use diesel::sql_types::*;

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

    liveness_event (id) {
        id -> Text,
        scoped_vault_id -> Text,
        liveness_source -> Text,
        attributes -> Nullable<Jsonb>,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        insight_event_id -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;

    manual_review (id) {
        id -> Text,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        completed_at -> Nullable<Timestamptz>,
        completed_by_decision_id -> Nullable<Text>,
        completed_by_actor -> Nullable<Jsonb>,
        review_reasons -> Array<Text>,
        workflow_id -> Text,
        scoped_vault_id -> Text,
    }
}

table! {
    use diesel::sql_types::*;

    middesk_request (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        created_at -> Timestamptz,
        decision_intent_id -> Text,
        business_id -> Nullable<Text>,
        state -> Text,
        completed_at -> Nullable<Timestamptz>,
        workflow_id -> Text,
    }
}

table! {
    use diesel::sql_types::*;

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
        appearance_id -> Nullable<Text>,
        cip_kind -> Nullable<Text>,
        optional_data -> Array<Text>,
        is_no_phone_flow -> Bool,
        is_doc_first -> Bool,
        allow_international_residents -> Bool,
        international_country_restrictions -> Nullable<Array<Text>>,
        author -> Nullable<Jsonb>,
        skip_kyc -> Bool,
        doc_scan_for_optional_ssn -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;

    onboarding_decision (id) {
        id -> Text,
        logic_git_hash -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        status -> Text,
        actor -> Jsonb,
        seqno -> Nullable<Int8>,
        workflow_id -> Text,
    }
}

table! {
    use diesel::sql_types::*;

    onboarding_decision_verification_result_junction (id) {
        id -> Text,
        verification_result_id -> Text,
        onboarding_decision_id -> Text,
    }
}

table! {
    use diesel::sql_types::*;

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
        status -> Text,
        deactivated_at -> Nullable<Timestamptz>,
    }
}

table! {
    use diesel::sql_types::*;

    proxy_config_header (id) {
        id -> Text,
        config_id -> Text,
        name -> Text,
        value -> Text,
    }
}

table! {
    use diesel::sql_types::*;

    proxy_config_ingress_rule (id) {
        id -> Text,
        config_id -> Text,
        token_path -> Text,
        target -> Text,
    }
}

table! {
    use diesel::sql_types::*;

    proxy_config_secret_header (id) {
        id -> Text,
        config_id -> Text,
        name -> Text,
        e_data -> Bytea,
    }
}

table! {
    use diesel::sql_types::*;

    proxy_config_server_cert (id) {
        id -> Text,
        config_id -> Text,
        cert_hash -> Bytea,
        cert_der -> Bytea,
    }
}

table! {
    use diesel::sql_types::*;

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

    risk_signal (id) {
        id -> Text,
        onboarding_decision_id -> Nullable<Text>,
        reason_code -> Text,
        created_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        verification_result_id -> Text,
        hidden -> Bool,
        vendor_api -> Text,
        risk_signal_group_id -> Text,
    }
}

table! {
    use diesel::sql_types::*;

    risk_signal_group (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        created_at -> Timestamptz,
        scoped_vault_id -> Text,
        kind -> Text,
    }
}

table! {
    use diesel::sql_types::*;

    scoped_vault (id) {
        id -> Text,
        fp_id -> Text,
        vault_id -> Text,
        tenant_id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        ordering_id -> Int8,
        start_timestamp -> Timestamptz,
        is_live -> Bool,
        status -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;

    session (key) {
        key -> Varchar,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        expires_at -> Timestamptz,
        data -> Bytea,
        kind -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;

    socure_device_session (id) {
        id -> Text,
        device_session_id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        workflow_id -> Text,
    }
}

table! {
    use diesel::sql_types::*;

    stytch_fingerprint_event (id) {
        id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        session_id -> Nullable<Text>,
        vault_id -> Nullable<Text>,
        scoped_vault_id -> Nullable<Text>,
        verification_result_id -> Text,
        browser_fingerprint -> Nullable<Text>,
        browser_id -> Nullable<Text>,
        hardware_fingerprint -> Nullable<Text>,
        network_fingerprint -> Nullable<Text>,
        visitor_fingerprint -> Nullable<Text>,
        visitor_id -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;

    task (id) {
        id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        scheduled_for -> Timestamptz,
        task_data -> Jsonb,
        status -> Text,
        num_attempts -> Int4,
    }
}

table! {
    use diesel::sql_types::*;

    task_execution (id) {
        id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        completed_at -> Nullable<Timestamptz>,
        task_id -> Text,
        attempt_num -> Int4,
        error -> Nullable<Text>,
        new_status -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;

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
        is_demo_tenant -> Bool,
        pinned_api_version -> Nullable<Int4>,
        is_prod_ob_config_restricted -> Bool,
        domain -> Nullable<Text>,
        allow_domain_access -> Bool,
        supported_auth_methods -> Nullable<Array<Text>>,
        app_clip_experience_id -> Text,
    }
}

table! {
    use diesel::sql_types::*;

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
        role_id -> Text,
        last_used_at -> Nullable<Timestamptz>,
        deactivated_at -> Nullable<Timestamptz>,
    }
}

table! {
    use diesel::sql_types::*;

    tenant_client_config (id) {
        id -> Text,
        tenant_id -> Text,
        is_live -> Bool,
        deactivated_at -> Nullable<Timestamptz>,
        allowed_origins -> Array<Text>,
    }
}

table! {
    use diesel::sql_types::*;

    tenant_role (id) {
        id -> Text,
        tenant_id -> Text,
        name -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        created_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        is_immutable -> Bool,
        scopes -> Array<Jsonb>,
        kind -> Text,
        is_live -> Nullable<Bool>,
    }
}

table! {
    use diesel::sql_types::*;

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

    tenant_vendor_control (id) {
        id -> Text,
        tenant_id -> Text,
        deactivated_at -> Nullable<Timestamptz>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        idology_enabled -> Bool,
        experian_enabled -> Bool,
        experian_subscriber_code -> Nullable<Text>,
        middesk_api_key -> Nullable<Bytea>,
    }
}

table! {
    use diesel::sql_types::*;

    user_consent (id) {
        id -> Text,
        timestamp -> Timestamptz,
        insight_event_id -> Text,
        consent_language_text -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        ml_consent -> Bool,
        workflow_id -> Text,
    }
}

table! {
    use diesel::sql_types::*;

    user_timeline (id) {
        id -> Text,
        scoped_vault_id -> Text,
        event -> Jsonb,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        vault_id -> Text,
        is_portable -> Bool,
        event_kind -> Text,
    }
}

table! {
    use diesel::sql_types::*;

    vault (id) {
        id -> Text,
        e_private_key -> Bytea,
        public_key -> Bytea,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        is_live -> Bool,
        is_portable -> Bool,
        kind -> Text,
        is_fixture -> Bool,
        idempotency_id -> Nullable<Text>,
        sandbox_id -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;

    vault_data (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        lifetime_id -> Text,
        kind -> Text,
        e_data -> Bytea,
        p_data -> Nullable<Text>,
    }
}

table! {
    use diesel::sql_types::*;

    verification_request (id) {
        id -> Text,
        vendor -> Text,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        vendor_api -> Text,
        uvw_snapshot_seqno -> Int8,
        identity_document_id -> Nullable<Text>,
        scoped_vault_id -> Text,
        decision_intent_id -> Text,
    }
}

table! {
    use diesel::sql_types::*;

    verification_result (id) {
        id -> Text,
        request_id -> Text,
        response -> Jsonb,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        e_response -> Nullable<Bytea>,
        is_error -> Bool,
    }
}

table! {
    use diesel::sql_types::*;

    watchlist_check (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        created_at -> Timestamptz,
        scoped_vault_id -> Text,
        task_id -> Text,
        decision_intent_id -> Nullable<Text>,
        status -> Text,
        logic_git_hash -> Nullable<Text>,
        reason_codes -> Nullable<Array<Text>>,
        completed_at -> Nullable<Timestamptz>,
        status_details -> Jsonb,
        deactivated_at -> Nullable<Timestamptz>,
    }
}

table! {
    use diesel::sql_types::*;

    webauthn_credential (id) {
        id -> Text,
        vault_id -> Text,
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

table! {
    use diesel::sql_types::*;

    workflow (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        created_at -> Timestamptz,
        scoped_vault_id -> Text,
        kind -> Text,
        state -> Text,
        config -> Jsonb,
        fixture_result -> Nullable<Text>,
        status -> Nullable<Text>,
        ob_configuration_id -> Nullable<Text>,
        insight_event_id -> Nullable<Text>,
        authorized_at -> Nullable<Timestamptz>,
        decision_made_at -> Nullable<Timestamptz>,
        completed_at -> Nullable<Timestamptz>,
        deactivated_at -> Nullable<Timestamptz>,
    }
}

table! {
    use diesel::sql_types::*;

    workflow_event (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        created_at -> Timestamptz,
        workflow_id -> Text,
        from_state -> Text,
        to_state -> Text,
    }
}

table! {
    use diesel::sql_types::*;

    zip_code (code) {
        code -> Text,
        city -> Text,
        state -> Nullable<Text>,
        state_code -> Nullable<Text>,
        latitude -> Float8,
        longitude -> Float8,
    }
}

joinable!(access_event -> insight_event (insight_event_id));
joinable!(access_event -> scoped_vault (scoped_vault_id));
joinable!(access_event -> tenant (tenant_id));
joinable!(annotation -> scoped_vault (scoped_vault_id));
joinable!(appearance -> tenant (tenant_id));
joinable!(apple_device_attestation -> vault (vault_id));
joinable!(apple_device_attestation -> webauthn_credential (webauthn_credential_id));
joinable!(auth_event -> insight_event (insight_event_id));
joinable!(auth_event -> scoped_vault (scoped_vault_id));
joinable!(auth_event -> vault (vault_id));
joinable!(auth_event -> webauthn_credential (webauthn_credential_id));
joinable!(billing_profile -> tenant (tenant_id));
joinable!(contact_info -> data_lifetime (lifetime_id));
joinable!(data_lifetime -> scoped_vault (scoped_vault_id));
joinable!(data_lifetime -> vault (vault_id));
joinable!(decision_intent -> scoped_vault (scoped_vault_id));
joinable!(decision_intent -> workflow (workflow_id));
joinable!(document_data -> data_lifetime (lifetime_id));
joinable!(document_request -> scoped_vault (scoped_vault_id));
joinable!(document_request -> workflow (workflow_id));
joinable!(document_upload -> identity_document (document_id));
joinable!(fingerprint -> data_lifetime (lifetime_id));
joinable!(fingerprint_visit_event -> scoped_vault (scoped_vault_id));
joinable!(fingerprint_visit_event -> vault (vault_id));
joinable!(google_device_attestation -> vault (vault_id));
joinable!(google_device_attestation -> webauthn_credential (webauthn_credential_id));
joinable!(identity_document -> document_request (request_id));
joinable!(incode_verification_session -> identity_document (identity_document_id));
joinable!(incode_verification_session_event -> identity_document (identity_document_id));
joinable!(incode_verification_session_event -> incode_verification_session (incode_verification_session_id));
joinable!(liveness_event -> insight_event (insight_event_id));
joinable!(liveness_event -> scoped_vault (scoped_vault_id));
joinable!(manual_review -> onboarding_decision (completed_by_decision_id));
joinable!(manual_review -> scoped_vault (scoped_vault_id));
joinable!(manual_review -> workflow (workflow_id));
joinable!(middesk_request -> decision_intent (decision_intent_id));
joinable!(middesk_request -> workflow (workflow_id));
joinable!(ob_configuration -> appearance (appearance_id));
joinable!(ob_configuration -> tenant (tenant_id));
joinable!(onboarding_decision -> workflow (workflow_id));
joinable!(onboarding_decision_verification_result_junction -> onboarding_decision (onboarding_decision_id));
joinable!(onboarding_decision_verification_result_junction -> verification_result (verification_result_id));
joinable!(proxy_config -> tenant (tenant_id));
joinable!(proxy_config_header -> proxy_config (config_id));
joinable!(proxy_config_ingress_rule -> proxy_config (config_id));
joinable!(proxy_config_secret_header -> proxy_config (config_id));
joinable!(proxy_config_server_cert -> proxy_config (config_id));
joinable!(proxy_request_log -> proxy_config (config_id));
joinable!(proxy_request_log -> tenant (tenant_id));
joinable!(risk_signal -> onboarding_decision (onboarding_decision_id));
joinable!(risk_signal -> risk_signal_group (risk_signal_group_id));
joinable!(risk_signal -> verification_result (verification_result_id));
joinable!(risk_signal_group -> scoped_vault (scoped_vault_id));
joinable!(scoped_vault -> tenant (tenant_id));
joinable!(scoped_vault -> vault (vault_id));
joinable!(socure_device_session -> workflow (workflow_id));
joinable!(stytch_fingerprint_event -> scoped_vault (scoped_vault_id));
joinable!(stytch_fingerprint_event -> vault (vault_id));
joinable!(stytch_fingerprint_event -> verification_result (verification_result_id));
joinable!(task_execution -> task (task_id));
joinable!(tenant_api_key -> tenant (tenant_id));
joinable!(tenant_api_key -> tenant_role (role_id));
joinable!(tenant_client_config -> tenant (tenant_id));
joinable!(tenant_role -> tenant (tenant_id));
joinable!(tenant_rolebinding -> tenant (tenant_id));
joinable!(tenant_rolebinding -> tenant_role (tenant_role_id));
joinable!(tenant_rolebinding -> tenant_user (tenant_user_id));
joinable!(tenant_vendor_control -> tenant (tenant_id));
joinable!(user_consent -> insight_event (insight_event_id));
joinable!(user_consent -> workflow (workflow_id));
joinable!(user_timeline -> scoped_vault (scoped_vault_id));
joinable!(user_timeline -> vault (vault_id));
joinable!(vault_data -> data_lifetime (lifetime_id));
joinable!(verification_request -> decision_intent (decision_intent_id));
joinable!(verification_request -> identity_document (identity_document_id));
joinable!(verification_request -> scoped_vault (scoped_vault_id));
joinable!(verification_result -> verification_request (request_id));
joinable!(watchlist_check -> decision_intent (decision_intent_id));
joinable!(watchlist_check -> scoped_vault (scoped_vault_id));
joinable!(watchlist_check -> task (task_id));
joinable!(webauthn_credential -> insight_event (insight_event_id));
joinable!(webauthn_credential -> vault (vault_id));
joinable!(workflow -> insight_event (insight_event_id));
joinable!(workflow -> ob_configuration (ob_configuration_id));
joinable!(workflow -> scoped_vault (scoped_vault_id));
joinable!(workflow_event -> workflow (workflow_id));

allow_tables_to_appear_in_same_query!(
    access_event,
    annotation,
    appearance,
    apple_device_attestation,
    auth_event,
    billing_profile,
    business_owner,
    contact_info,
    custom_migration,
    data_lifetime,
    decision_intent,
    document_data,
    document_request,
    document_upload,
    fingerprint,
    fingerprint_visit_event,
    google_device_attestation,
    identity_document,
    identity_document_backup,
    incode_verification_session,
    incode_verification_session_event,
    insight_event,
    liveness_event,
    manual_review,
    middesk_request,
    ob_configuration,
    onboarding_decision,
    onboarding_decision_verification_result_junction,
    proxy_config,
    proxy_config_header,
    proxy_config_ingress_rule,
    proxy_config_secret_header,
    proxy_config_server_cert,
    proxy_request_log,
    risk_signal,
    risk_signal_group,
    scoped_vault,
    session,
    socure_device_session,
    stytch_fingerprint_event,
    task,
    task_execution,
    tenant,
    tenant_api_key,
    tenant_client_config,
    tenant_role,
    tenant_rolebinding,
    tenant_user,
    tenant_vendor_control,
    user_consent,
    user_timeline,
    vault,
    vault_data,
    verification_request,
    verification_result,
    watchlist_check,
    webauthn_credential,
    workflow,
    workflow_event,
    zip_code,
);
