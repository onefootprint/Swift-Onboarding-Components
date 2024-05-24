// @generated automatically by Diesel CLI.

diesel::table! {
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
        targets -> Array<Nullable<Text>>,
        tenant_id -> Text,
        is_live -> Bool,
        purpose -> Text,
    }
}

diesel::table! {
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

diesel::table! {
    use diesel::sql_types::*;

    appearance (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        tenant_id -> Text,
        data -> Jsonb,
    }
}

diesel::table! {
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

diesel::table! {
    use diesel::sql_types::*;

    audit_event (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        timestamp -> Timestamptz,
        tenant_id -> Text,
        name -> Text,
        principal_actor -> Jsonb,
        insight_event_id -> Text,
        metadata -> Jsonb,
        scoped_vault_id -> Nullable<Text>,
        ob_configuration_id -> Nullable<Text>,
        document_data_id -> Nullable<Text>,
        tenant_api_key_id -> Nullable<Text>,
        tenant_user_id -> Nullable<Text>,
        tenant_role_id -> Nullable<Text>,
        is_live -> Nullable<Bool>,
        list_entry_creation_id -> Nullable<Text>,
        list_entry_id -> Nullable<Text>,
        list_id -> Nullable<Text>,
    }
}

diesel::table! {
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
        scope -> Text,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    billing_event (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        timestamp -> Timestamptz,
        kind -> Text,
        scoped_vault_id -> Text,
        ob_configuration_id -> Nullable<Text>,
        existing_event_id -> Nullable<Text>,
    }
}

diesel::table! {
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
        adverse_media_per_user -> Nullable<Text>,
        continuous_monitoring_per_year -> Nullable<Text>,
        monthly_minimum -> Nullable<Text>,
        kyc_waterfall_second_vendor -> Nullable<Text>,
        kyc_waterfall_third_vendor -> Nullable<Text>,
        one_click_kyc -> Nullable<Text>,
    }
}

diesel::table! {
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

diesel::table! {
    use diesel::sql_types::*;

    compliance_doc (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        tenant_compliance_partnership_id -> Text,
        template_id -> Nullable<Text>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    compliance_doc_assignment (id) {
        id -> Text,
        created_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        compliance_doc_id -> Text,
        kind -> Text,
        assigned_to_tenant_user_id -> Nullable<Text>,
        assigned_by_tenant_user_id -> Text,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    compliance_doc_request (id) {
        id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        name -> Text,
        description -> Text,
        requested_by_partner_tenant_user_id -> Nullable<Text>,
        compliance_doc_id -> Text,
        deactivated_by_partner_tenant_user_id -> Nullable<Text>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    compliance_doc_review (id) {
        id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        submission_id -> Text,
        reviewed_by_partner_tenant_user_id -> Text,
        decision -> Text,
        note -> Text,
        deactivated_at -> Nullable<Timestamptz>,
        compliance_doc_id -> Text,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    compliance_doc_submission (id) {
        id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        request_id -> Text,
        submitted_by_tenant_user_id -> Text,
        doc_data -> Jsonb,
        deactivated_at -> Nullable<Timestamptz>,
        compliance_doc_id -> Text,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    compliance_doc_template (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        partner_tenant_id -> Text,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    compliance_doc_template_version (id) {
        id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        created_by_partner_tenant_user_id -> Nullable<Text>,
        template_id -> Text,
        name -> Text,
        description -> Text,
        deactivated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
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

diesel::table! {
    use diesel::sql_types::*;

    custom_migration (version) {
        version -> Text,
        run_on -> Timestamptz,
    }
}

diesel::table! {
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
        actor -> Nullable<Jsonb>,
        origin_id -> Nullable<Text>,
    }
}

diesel::table! {
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

diesel::table! {
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

diesel::table! {
    use diesel::sql_types::*;

    document_request (id) {
        id -> Text,
        scoped_vault_id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        workflow_id -> Text,
        kind -> Text,
        rule_set_result_id -> Nullable<Text>,
        config -> Jsonb,
    }
}

diesel::table! {
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
        failure_reasons -> Array<Nullable<Text>>,
        is_instant_app -> Nullable<Bool>,
        is_app_clip -> Nullable<Bool>,
        is_manual -> Nullable<Bool>,
        is_extra_compressed -> Bool,
        is_upload -> Nullable<Bool>,
        is_forced_upload -> Nullable<Bool>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    fingerprint (id) {
        id -> Text,
        sh_data -> Nullable<Bytea>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        kind -> Text,
        version -> Text,
        scope -> Text,
        is_hidden -> Bool,
        scoped_vault_id -> Text,
        vault_id -> Text,
        tenant_id -> Text,
        is_live -> Bool,
        deactivated_at -> Nullable<Timestamptz>,
        p_data -> Nullable<Text>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    fingerprint_junction (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        fingerprint_id -> Text,
        lifetime_id -> Text,
    }
}

diesel::table! {
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

diesel::table! {
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

diesel::table! {
    use diesel::sql_types::*;

    identity_document (id) {
        id -> Text,
        request_id -> Text,
        document_type -> Text,
        country_code -> Nullable<Text>,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        completed_seqno -> Nullable<Int8>,
        document_score -> Nullable<Float8>,
        selfie_score -> Nullable<Float8>,
        ocr_confidence_score -> Nullable<Float8>,
        status -> Text,
        fixture_result -> Nullable<Text>,
        skip_selfie -> Nullable<Bool>,
        device_type -> Nullable<Text>,
        vaulted_document_type -> Nullable<Text>,
        curp_completed_seqno -> Nullable<Int8>,
        validated_country_code -> Nullable<Text>,
        review_status -> Text,
        insight_event_id -> Nullable<Text>,
    }
}

diesel::table! {
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

diesel::table! {
    use diesel::sql_types::*;

    incode_customer_session (id) {
        id -> Text,
        created_at -> Timestamptz,
        scoped_vault_id -> Text,
        tenant_id -> Text,
        incode_verification_session_id -> Text,
        incode_customer_id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

diesel::table! {
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
        latest_failure_reasons -> Array<Nullable<Text>>,
        ignored_failure_reasons -> Array<Nullable<Text>>,
        deactivated_at -> Nullable<Timestamptz>,
        incode_environment -> Nullable<Text>,
        latest_hard_error -> Nullable<Text>,
        purpose -> Text,
    }
}

diesel::table! {
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
        latest_failure_reasons -> Array<Nullable<Text>>,
        ignored_failure_reasons -> Array<Nullable<Text>>,
    }
}

diesel::table! {
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
        session_id -> Nullable<Text>,
        origin -> Nullable<Text>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    list (id) {
        id -> Text,
        created_at -> Timestamptz,
        created_seqno -> Int8,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        deactivated_seqno -> Nullable<Int8>,
        tenant_id -> Text,
        is_live -> Bool,
        actor -> Jsonb,
        name -> Text,
        alias -> Text,
        kind -> Text,
        e_data_key -> Bytea,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    list_entry (id) {
        id -> Text,
        created_at -> Timestamptz,
        created_seqno -> Int8,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        deactivated_seqno -> Nullable<Int8>,
        list_id -> Text,
        actor -> Jsonb,
        e_data -> Bytea,
        deactivated_by -> Nullable<Jsonb>,
        list_entry_creation_id -> Nullable<Text>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    list_entry_creation (id) {
        id -> Text,
        created_at -> Timestamptz,
        created_seqno -> Int8,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        list_id -> Text,
        actor -> Jsonb,
    }
}

diesel::table! {
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
        skip_context -> Nullable<Jsonb>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    manual_review (id) {
        id -> Text,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        completed_at -> Nullable<Timestamptz>,
        completed_by_decision_id -> Nullable<Text>,
        completed_by_actor -> Nullable<Jsonb>,
        review_reasons -> Array<Nullable<Text>>,
        workflow_id -> Text,
        scoped_vault_id -> Text,
        kind -> Text,
    }
}

diesel::table! {
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

diesel::table! {
    use diesel::sql_types::*;

    neuro_id_analytics_event (id) {
        id -> Text,
        verification_result_id -> Text,
        workflow_id -> Text,
        scoped_vault_id -> Text,
        tenant_id -> Text,
        neuro_identifier -> Text,
        cookie_id -> Nullable<Text>,
        device_id -> Nullable<Text>,
        model_fraud_ring_indicator_result -> Nullable<Bool>,
        model_automated_activity_result -> Nullable<Bool>,
        model_risky_device_result -> Nullable<Bool>,
        model_factory_reset_result -> Nullable<Bool>,
        model_gps_spoofing_result -> Nullable<Bool>,
        model_tor_exit_node_result -> Nullable<Bool>,
        model_public_proxy_result -> Nullable<Bool>,
        model_vpn_result -> Nullable<Bool>,
        model_ip_blocklist_result -> Nullable<Bool>,
        model_ip_address_association_result -> Nullable<Bool>,
        model_incognito_result -> Nullable<Bool>,
        model_bot_framework_result -> Nullable<Bool>,
        model_suspicious_device_result -> Nullable<Bool>,
        model_multiple_ids_per_device_result -> Nullable<Bool>,
        model_device_reputation_result -> Nullable<Bool>,
        suspicious_device_emulator -> Nullable<Bool>,
        suspicious_device_jailbroken -> Nullable<Bool>,
        suspicious_device_missing_expected_properties -> Nullable<Bool>,
        suspicious_device_frida -> Nullable<Bool>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

diesel::table! {
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
        must_collect_data -> Array<Nullable<Text>>,
        can_access_data -> Array<Nullable<Text>>,
        appearance_id -> Nullable<Text>,
        cip_kind -> Nullable<Text>,
        optional_data -> Array<Nullable<Text>>,
        is_no_phone_flow -> Bool,
        is_doc_first -> Bool,
        allow_international_residents -> Bool,
        international_country_restrictions -> Nullable<Array<Nullable<Text>>>,
        author -> Nullable<Jsonb>,
        skip_kyc -> Bool,
        doc_scan_for_optional_ssn -> Nullable<Text>,
        enhanced_aml -> Jsonb,
        allow_us_residents -> Bool,
        allow_us_territory_residents -> Bool,
        kind -> Text,
        skip_kyb -> Bool,
        skip_confirm -> Bool,
        document_types_and_countries -> Nullable<Jsonb>,
        curp_validation_enabled -> Bool,
        documents_to_collect -> Nullable<Array<Nullable<Jsonb>>>,
        verification_checks -> Nullable<Array<Nullable<Jsonb>>>,
    }
}

diesel::table! {
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
        rule_set_result_id -> Nullable<Text>,
        failed_for_doc_review -> Bool,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    onboarding_decision_verification_result_junction (id) {
        id -> Text,
        verification_result_id -> Text,
        onboarding_decision_id -> Text,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    partner_tenant (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        name -> Text,
        public_key -> Bytea,
        e_private_key -> Bytea,
        supported_auth_methods -> Nullable<Array<Nullable<Text>>>,
        domains -> Array<Nullable<Text>>,
        allow_domain_access -> Bool,
        logo_url -> Nullable<Text>,
        website_url -> Nullable<Text>,
    }
}

diesel::table! {
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

diesel::table! {
    use diesel::sql_types::*;

    proxy_config_header (id) {
        id -> Text,
        config_id -> Text,
        name -> Text,
        value -> Text,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    proxy_config_ingress_rule (id) {
        id -> Text,
        config_id -> Text,
        token_path -> Text,
        target -> Text,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    proxy_config_secret_header (id) {
        id -> Text,
        config_id -> Text,
        name -> Text,
        e_data -> Bytea,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    proxy_config_server_cert (id) {
        id -> Text,
        config_id -> Text,
        cert_hash -> Bytea,
        cert_der -> Bytea,
    }
}

diesel::table! {
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

diesel::table! {
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
        seqno -> Int8,
    }
}

diesel::table! {
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

diesel::table! {
    use diesel::sql_types::*;

    rule_instance (id) {
        id -> Text,
        created_at -> Timestamptz,
        created_seqno -> Int8,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        deactivated_seqno -> Nullable<Int8>,
        rule_id -> Text,
        ob_configuration_id -> Text,
        actor -> Jsonb,
        name -> Nullable<Text>,
        rule_expression -> Jsonb,
        action -> Text,
        is_shadow -> Bool,
        kind -> Text,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    rule_instance_references_list (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        rule_instance_id -> Text,
        list_id -> Text,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    rule_result (id) {
        id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        rule_instance_id -> Text,
        rule_set_result_id -> Text,
        result -> Bool,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    rule_set (id) {
        id -> Text,
        created_at -> Timestamptz,
        created_seqno -> Int8,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        deactivated_seqno -> Nullable<Int8>,
        version -> Int4,
        ob_configuration_id -> Text,
        actor -> Jsonb,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    rule_set_result (id) {
        id -> Text,
        created_at -> Timestamptz,
        created_seqno -> Int8,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        ob_configuration_id -> Text,
        scoped_vault_id -> Text,
        workflow_id -> Nullable<Text>,
        kind -> Text,
        action_triggered -> Nullable<Text>,
        allowed_actions -> Nullable<Array<Nullable<Text>>>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    rule_set_result_risk_signal_junction (id) {
        id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        rule_set_result_id -> Text,
        risk_signal_id -> Text,
    }
}

diesel::table! {
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
        is_billable -> Bool,
        last_heartbeat_at -> Timestamptz,
        show_in_search -> Bool,
        snapshot_seqno -> Int8,
        external_id -> Nullable<Text>,
        last_activity_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        kind -> Text,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    scoped_vault_label (id) {
        id -> Text,
        created_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        created_seqno -> Int8,
        deactivated_seqno -> Nullable<Int8>,
        scoped_vault_id -> Text,
        kind -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    scoped_vault_tag (id) {
        id -> Text,
        created_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        created_seqno -> Int8,
        deactivated_seqno -> Nullable<Int8>,
        scoped_vault_id -> Text,
        kind -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

diesel::table! {
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

diesel::table! {
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

diesel::table! {
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

diesel::table! {
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
        max_lease_duration_s -> Nullable<Int4>,
        last_leased_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
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

diesel::table! {
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
        allow_domain_access -> Bool,
        supported_auth_methods -> Nullable<Array<Nullable<Text>>>,
        app_clip_experience_id -> Text,
        is_prod_kyb_playbook_restricted -> Bool,
        domains -> Array<Nullable<Text>>,
        is_prod_auth_playbook_restricted -> Bool,
        allowed_preview_apis -> Array<Nullable<Text>>,
        support_email -> Nullable<Text>,
        support_phone -> Nullable<Text>,
        support_website -> Nullable<Text>,
        super_tenant_id -> Nullable<Text>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    tenant_android_app_meta (id) {
        id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        tenant_id -> Text,
        package_names -> Array<Nullable<Text>>,
        apk_cert_sha256s -> Array<Nullable<Text>>,
        e_integrity_verification_key -> Bytea,
        e_integrity_decryption_key -> Bytea,
        deactivated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
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

diesel::table! {
    use diesel::sql_types::*;

    tenant_business_info (id) {
        id -> Text,
        created_at -> Timestamptz,
        created_seqno -> Int8,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        deactivated_seqno -> Nullable<Int8>,
        tenant_id -> Text,
        company_name -> Bytea,
        address_line1 -> Bytea,
        city -> Bytea,
        state -> Bytea,
        zip -> Bytea,
        phone -> Bytea,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    tenant_client_config (id) {
        id -> Text,
        tenant_id -> Text,
        is_live -> Bool,
        deactivated_at -> Nullable<Timestamptz>,
        allowed_origins -> Array<Nullable<Text>>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    tenant_compliance_partnership (id) {
        id -> Text,
        tenant_id -> Text,
        partner_tenant_id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    tenant_frequent_note (id) {
        id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        tenant_id -> Text,
        created_by_actor -> Jsonb,
        kind -> Text,
        content -> Text,
        deactivated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    tenant_ios_app_meta (id) {
        id -> Text,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        tenant_id -> Text,
        team_id -> Text,
        app_bundle_ids -> Array<Nullable<Text>>,
        device_check_key_id -> Text,
        e_device_check_private_key -> Bytea,
        deactivated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    tenant_role (id) {
        id -> Text,
        tenant_id -> Nullable<Text>,
        name -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        created_at -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        is_immutable -> Bool,
        scopes -> Array<Nullable<Jsonb>>,
        kind -> Text,
        is_live -> Nullable<Bool>,
        partner_tenant_id -> Nullable<Text>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    tenant_rolebinding (id) {
        id -> Text,
        tenant_user_id -> Text,
        tenant_role_id -> Text,
        last_login_at -> Nullable<Timestamptz>,
        deactivated_at -> Nullable<Timestamptz>,
        created_at -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

diesel::table! {
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

diesel::table! {
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
        lexis_enabled -> Bool,
    }
}

diesel::table! {
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

diesel::table! {
    use diesel::sql_types::*;

    user_timeline (id) {
        id -> Text,
        scoped_vault_id -> Text,
        event -> Jsonb,
        timestamp -> Timestamptz,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        vault_id -> Text,
        event_kind -> Text,
        is_backfilled -> Bool,
        seqno -> Int8,
    }
}

diesel::table! {
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
        is_created_via_api -> Bool,
        is_verified -> Bool,
        created_at -> Timestamptz,
        is_identifiable -> Bool,
        is_hidden -> Bool,
        duplicate_of_id -> Nullable<Text>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    vault_data (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        lifetime_id -> Text,
        kind -> Text,
        e_data -> Bytea,
        p_data -> Nullable<Text>,
        format -> Text,
    }
}

diesel::table! {
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

diesel::table! {
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

diesel::table! {
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
        reason_codes -> Nullable<Array<Nullable<Text>>>,
        completed_at -> Nullable<Timestamptz>,
        status_details -> Jsonb,
        deactivated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    waterfall_execution (id) {
        id -> Text,
        created_at -> Timestamptz,
        decision_intent_id -> Text,
        available_vendor_apis -> Array<Nullable<Text>>,
        completed_at -> Nullable<Timestamptz>,
        latest_step -> Int4,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

diesel::table! {
    use diesel::sql_types::*;

    waterfall_step (id) {
        id -> Text,
        execution_id -> Text,
        created_at -> Timestamptz,
        vendor_api -> Text,
        step -> Int4,
        verification_result_id -> Nullable<Text>,
        verification_result_is_error -> Nullable<Bool>,
        rules_result -> Nullable<Jsonb>,
        action -> Nullable<Text>,
        deactivated_at -> Nullable<Timestamptz>,
        completed_at -> Nullable<Timestamptz>,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
    }
}

diesel::table! {
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
        deactivated_at -> Nullable<Timestamptz>,
    }
}

diesel::table! {
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
        source -> Text,
        is_one_click -> Bool,
        session_validated_at -> Nullable<Timestamptz>,
        is_neuro_enabled -> Bool,
    }
}

diesel::table! {
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

diesel::table! {
    use diesel::sql_types::*;

    workflow_request (id) {
        id -> Text,
        _created_at -> Timestamptz,
        _updated_at -> Timestamptz,
        timestamp -> Timestamptz,
        deactivated_at -> Nullable<Timestamptz>,
        scoped_vault_id -> Text,
        ob_configuration_id -> Text,
        created_by -> Jsonb,
        workflow_id -> Nullable<Text>,
        config -> Jsonb,
        note -> Nullable<Text>,
    }
}

diesel::table! {
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

diesel::joinable!(access_event -> insight_event (insight_event_id));
diesel::joinable!(access_event -> scoped_vault (scoped_vault_id));
diesel::joinable!(access_event -> tenant (tenant_id));
diesel::joinable!(annotation -> scoped_vault (scoped_vault_id));
diesel::joinable!(appearance -> tenant (tenant_id));
diesel::joinable!(apple_device_attestation -> vault (vault_id));
diesel::joinable!(apple_device_attestation -> webauthn_credential (webauthn_credential_id));
diesel::joinable!(audit_event -> document_data (document_data_id));
diesel::joinable!(audit_event -> insight_event (insight_event_id));
diesel::joinable!(audit_event -> list (list_id));
diesel::joinable!(audit_event -> list_entry (list_entry_id));
diesel::joinable!(audit_event -> list_entry_creation (list_entry_creation_id));
diesel::joinable!(audit_event -> ob_configuration (ob_configuration_id));
diesel::joinable!(audit_event -> scoped_vault (scoped_vault_id));
diesel::joinable!(audit_event -> tenant (tenant_id));
diesel::joinable!(audit_event -> tenant_api_key (tenant_api_key_id));
diesel::joinable!(audit_event -> tenant_role (tenant_role_id));
diesel::joinable!(audit_event -> tenant_user (tenant_user_id));
diesel::joinable!(auth_event -> insight_event (insight_event_id));
diesel::joinable!(auth_event -> scoped_vault (scoped_vault_id));
diesel::joinable!(auth_event -> vault (vault_id));
diesel::joinable!(auth_event -> webauthn_credential (webauthn_credential_id));
diesel::joinable!(billing_event -> ob_configuration (ob_configuration_id));
diesel::joinable!(billing_event -> scoped_vault (scoped_vault_id));
diesel::joinable!(billing_profile -> tenant (tenant_id));
diesel::joinable!(compliance_doc -> compliance_doc_template (template_id));
diesel::joinable!(compliance_doc -> tenant_compliance_partnership (tenant_compliance_partnership_id));
diesel::joinable!(compliance_doc_assignment -> compliance_doc (compliance_doc_id));
diesel::joinable!(compliance_doc_request -> compliance_doc (compliance_doc_id));
diesel::joinable!(compliance_doc_review -> compliance_doc (compliance_doc_id));
diesel::joinable!(compliance_doc_review -> compliance_doc_submission (submission_id));
diesel::joinable!(compliance_doc_review -> tenant_user (reviewed_by_partner_tenant_user_id));
diesel::joinable!(compliance_doc_submission -> compliance_doc (compliance_doc_id));
diesel::joinable!(compliance_doc_submission -> compliance_doc_request (request_id));
diesel::joinable!(compliance_doc_submission -> tenant_user (submitted_by_tenant_user_id));
diesel::joinable!(compliance_doc_template -> partner_tenant (partner_tenant_id));
diesel::joinable!(compliance_doc_template_version -> compliance_doc_template (template_id));
diesel::joinable!(compliance_doc_template_version -> tenant_user (created_by_partner_tenant_user_id));
diesel::joinable!(contact_info -> data_lifetime (lifetime_id));
diesel::joinable!(data_lifetime -> scoped_vault (scoped_vault_id));
diesel::joinable!(data_lifetime -> vault (vault_id));
diesel::joinable!(decision_intent -> scoped_vault (scoped_vault_id));
diesel::joinable!(decision_intent -> workflow (workflow_id));
diesel::joinable!(document_data -> data_lifetime (lifetime_id));
diesel::joinable!(document_request -> rule_set_result (rule_set_result_id));
diesel::joinable!(document_request -> scoped_vault (scoped_vault_id));
diesel::joinable!(document_request -> workflow (workflow_id));
diesel::joinable!(document_upload -> identity_document (document_id));
diesel::joinable!(fingerprint -> scoped_vault (scoped_vault_id));
diesel::joinable!(fingerprint -> tenant (tenant_id));
diesel::joinable!(fingerprint -> vault (vault_id));
diesel::joinable!(fingerprint_junction -> data_lifetime (lifetime_id));
diesel::joinable!(fingerprint_junction -> fingerprint (fingerprint_id));
diesel::joinable!(fingerprint_visit_event -> scoped_vault (scoped_vault_id));
diesel::joinable!(fingerprint_visit_event -> vault (vault_id));
diesel::joinable!(google_device_attestation -> vault (vault_id));
diesel::joinable!(google_device_attestation -> webauthn_credential (webauthn_credential_id));
diesel::joinable!(identity_document -> document_request (request_id));
diesel::joinable!(identity_document -> insight_event (insight_event_id));
diesel::joinable!(incode_customer_session -> incode_verification_session (incode_verification_session_id));
diesel::joinable!(incode_customer_session -> scoped_vault (scoped_vault_id));
diesel::joinable!(incode_customer_session -> tenant (tenant_id));
diesel::joinable!(incode_verification_session -> identity_document (identity_document_id));
diesel::joinable!(incode_verification_session_event -> identity_document (identity_document_id));
diesel::joinable!(incode_verification_session_event -> incode_verification_session (incode_verification_session_id));
diesel::joinable!(list -> tenant (tenant_id));
diesel::joinable!(list_entry -> list (list_id));
diesel::joinable!(list_entry -> list_entry_creation (list_entry_creation_id));
diesel::joinable!(list_entry_creation -> list (list_id));
diesel::joinable!(liveness_event -> insight_event (insight_event_id));
diesel::joinable!(liveness_event -> scoped_vault (scoped_vault_id));
diesel::joinable!(manual_review -> onboarding_decision (completed_by_decision_id));
diesel::joinable!(manual_review -> scoped_vault (scoped_vault_id));
diesel::joinable!(manual_review -> workflow (workflow_id));
diesel::joinable!(middesk_request -> decision_intent (decision_intent_id));
diesel::joinable!(middesk_request -> workflow (workflow_id));
diesel::joinable!(neuro_id_analytics_event -> scoped_vault (scoped_vault_id));
diesel::joinable!(neuro_id_analytics_event -> tenant (tenant_id));
diesel::joinable!(neuro_id_analytics_event -> verification_result (verification_result_id));
diesel::joinable!(neuro_id_analytics_event -> workflow (workflow_id));
diesel::joinable!(ob_configuration -> appearance (appearance_id));
diesel::joinable!(ob_configuration -> tenant (tenant_id));
diesel::joinable!(onboarding_decision -> rule_set_result (rule_set_result_id));
diesel::joinable!(onboarding_decision -> workflow (workflow_id));
diesel::joinable!(onboarding_decision_verification_result_junction -> onboarding_decision (onboarding_decision_id));
diesel::joinable!(onboarding_decision_verification_result_junction -> verification_result (verification_result_id));
diesel::joinable!(proxy_config -> tenant (tenant_id));
diesel::joinable!(proxy_config_header -> proxy_config (config_id));
diesel::joinable!(proxy_config_ingress_rule -> proxy_config (config_id));
diesel::joinable!(proxy_config_secret_header -> proxy_config (config_id));
diesel::joinable!(proxy_config_server_cert -> proxy_config (config_id));
diesel::joinable!(proxy_request_log -> proxy_config (config_id));
diesel::joinable!(proxy_request_log -> tenant (tenant_id));
diesel::joinable!(risk_signal -> onboarding_decision (onboarding_decision_id));
diesel::joinable!(risk_signal -> risk_signal_group (risk_signal_group_id));
diesel::joinable!(risk_signal -> verification_result (verification_result_id));
diesel::joinable!(risk_signal_group -> scoped_vault (scoped_vault_id));
diesel::joinable!(rule_instance -> ob_configuration (ob_configuration_id));
diesel::joinable!(rule_instance_references_list -> list (list_id));
diesel::joinable!(rule_instance_references_list -> rule_instance (rule_instance_id));
diesel::joinable!(rule_result -> rule_instance (rule_instance_id));
diesel::joinable!(rule_result -> rule_set_result (rule_set_result_id));
diesel::joinable!(rule_set -> ob_configuration (ob_configuration_id));
diesel::joinable!(rule_set_result -> ob_configuration (ob_configuration_id));
diesel::joinable!(rule_set_result -> scoped_vault (scoped_vault_id));
diesel::joinable!(rule_set_result -> workflow (workflow_id));
diesel::joinable!(rule_set_result_risk_signal_junction -> risk_signal (risk_signal_id));
diesel::joinable!(rule_set_result_risk_signal_junction -> rule_set_result (rule_set_result_id));
diesel::joinable!(scoped_vault -> tenant (tenant_id));
diesel::joinable!(scoped_vault -> vault (vault_id));
diesel::joinable!(scoped_vault_label -> scoped_vault (scoped_vault_id));
diesel::joinable!(scoped_vault_tag -> scoped_vault (scoped_vault_id));
diesel::joinable!(socure_device_session -> workflow (workflow_id));
diesel::joinable!(stytch_fingerprint_event -> scoped_vault (scoped_vault_id));
diesel::joinable!(stytch_fingerprint_event -> vault (vault_id));
diesel::joinable!(stytch_fingerprint_event -> verification_result (verification_result_id));
diesel::joinable!(task_execution -> task (task_id));
diesel::joinable!(tenant_android_app_meta -> tenant (tenant_id));
diesel::joinable!(tenant_api_key -> tenant (tenant_id));
diesel::joinable!(tenant_api_key -> tenant_role (role_id));
diesel::joinable!(tenant_business_info -> tenant (tenant_id));
diesel::joinable!(tenant_client_config -> tenant (tenant_id));
diesel::joinable!(tenant_compliance_partnership -> partner_tenant (partner_tenant_id));
diesel::joinable!(tenant_compliance_partnership -> tenant (tenant_id));
diesel::joinable!(tenant_frequent_note -> tenant (tenant_id));
diesel::joinable!(tenant_ios_app_meta -> tenant (tenant_id));
diesel::joinable!(tenant_role -> partner_tenant (partner_tenant_id));
diesel::joinable!(tenant_role -> tenant (tenant_id));
diesel::joinable!(tenant_rolebinding -> tenant_role (tenant_role_id));
diesel::joinable!(tenant_rolebinding -> tenant_user (tenant_user_id));
diesel::joinable!(tenant_vendor_control -> tenant (tenant_id));
diesel::joinable!(user_consent -> insight_event (insight_event_id));
diesel::joinable!(user_consent -> workflow (workflow_id));
diesel::joinable!(user_timeline -> scoped_vault (scoped_vault_id));
diesel::joinable!(user_timeline -> vault (vault_id));
diesel::joinable!(vault_data -> data_lifetime (lifetime_id));
diesel::joinable!(verification_request -> decision_intent (decision_intent_id));
diesel::joinable!(verification_request -> identity_document (identity_document_id));
diesel::joinable!(verification_request -> scoped_vault (scoped_vault_id));
diesel::joinable!(verification_result -> verification_request (request_id));
diesel::joinable!(watchlist_check -> decision_intent (decision_intent_id));
diesel::joinable!(watchlist_check -> scoped_vault (scoped_vault_id));
diesel::joinable!(watchlist_check -> task (task_id));
diesel::joinable!(waterfall_execution -> decision_intent (decision_intent_id));
diesel::joinable!(waterfall_step -> verification_result (verification_result_id));
diesel::joinable!(waterfall_step -> waterfall_execution (execution_id));
diesel::joinable!(webauthn_credential -> insight_event (insight_event_id));
diesel::joinable!(webauthn_credential -> vault (vault_id));
diesel::joinable!(workflow -> insight_event (insight_event_id));
diesel::joinable!(workflow -> ob_configuration (ob_configuration_id));
diesel::joinable!(workflow -> scoped_vault (scoped_vault_id));
diesel::joinable!(workflow_event -> workflow (workflow_id));
diesel::joinable!(workflow_request -> ob_configuration (ob_configuration_id));
diesel::joinable!(workflow_request -> scoped_vault (scoped_vault_id));
diesel::joinable!(workflow_request -> workflow (workflow_id));

diesel::allow_tables_to_appear_in_same_query!(
    access_event,
    annotation,
    appearance,
    apple_device_attestation,
    audit_event,
    auth_event,
    billing_event,
    billing_profile,
    business_owner,
    compliance_doc,
    compliance_doc_assignment,
    compliance_doc_request,
    compliance_doc_review,
    compliance_doc_submission,
    compliance_doc_template,
    compliance_doc_template_version,
    contact_info,
    custom_migration,
    data_lifetime,
    decision_intent,
    document_data,
    document_request,
    document_upload,
    fingerprint,
    fingerprint_junction,
    fingerprint_visit_event,
    google_device_attestation,
    identity_document,
    identity_document_backup,
    incode_customer_session,
    incode_verification_session,
    incode_verification_session_event,
    insight_event,
    list,
    list_entry,
    list_entry_creation,
    liveness_event,
    manual_review,
    middesk_request,
    neuro_id_analytics_event,
    ob_configuration,
    onboarding_decision,
    onboarding_decision_verification_result_junction,
    partner_tenant,
    proxy_config,
    proxy_config_header,
    proxy_config_ingress_rule,
    proxy_config_secret_header,
    proxy_config_server_cert,
    proxy_request_log,
    risk_signal,
    risk_signal_group,
    rule_instance,
    rule_instance_references_list,
    rule_result,
    rule_set,
    rule_set_result,
    rule_set_result_risk_signal_junction,
    scoped_vault,
    scoped_vault_label,
    scoped_vault_tag,
    session,
    socure_device_session,
    stytch_fingerprint_event,
    task,
    task_execution,
    tenant,
    tenant_android_app_meta,
    tenant_api_key,
    tenant_business_info,
    tenant_client_config,
    tenant_compliance_partnership,
    tenant_frequent_note,
    tenant_ios_app_meta,
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
    waterfall_execution,
    waterfall_step,
    webauthn_credential,
    workflow,
    workflow_event,
    workflow_request,
    zip_code,
);
