use crate::DbResult;
use crate::TxnPgConn;
use db_schema::schema::apple_device_attestation;
use db_schema::schema::auth_event;
use db_schema::schema::rule_result;
use db_schema::schema::rule_set_result;
use db_schema::schema::rule_set_result_risk_signal_junction;
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::VaultId;

#[tracing::instrument(skip_all)]
pub fn private_cleanup_integration_tests(conn: &mut TxnPgConn, uvid: VaultId) -> DbResult<usize> {
    // we register users within our integration tests. to avoid filling up our database with fake
    // information, we clean up afterwards.

    use db_schema::schema::access_event;
    use db_schema::schema::annotation;
    use db_schema::schema::audit_event;
    use db_schema::schema::billing_event;
    use db_schema::schema::business_owner;
    use db_schema::schema::contact_info;
    use db_schema::schema::data_lifetime;
    use db_schema::schema::decision_intent;
    use db_schema::schema::document_data;
    use db_schema::schema::document_request;
    use db_schema::schema::document_upload;
    use db_schema::schema::fingerprint;
    use db_schema::schema::fingerprint_junction;
    use db_schema::schema::fingerprint_visit_event;
    use db_schema::schema::identity_document;
    use db_schema::schema::incode_verification_session;
    use db_schema::schema::incode_verification_session_event;
    use db_schema::schema::liveness_event;
    use db_schema::schema::manual_review;
    use db_schema::schema::middesk_request;
    use db_schema::schema::onboarding_decision;
    use db_schema::schema::onboarding_decision_verification_result_junction;
    use db_schema::schema::risk_signal;
    use db_schema::schema::risk_signal_group;
    use db_schema::schema::scoped_vault;
    use db_schema::schema::socure_device_session;
    use db_schema::schema::stytch_fingerprint_event;
    use db_schema::schema::user_consent;
    use db_schema::schema::user_timeline;
    use db_schema::schema::vault;
    use db_schema::schema::vault_data;
    use db_schema::schema::vault_dr_blob;
    use db_schema::schema::verification_request;
    use db_schema::schema::verification_result;
    use db_schema::schema::watchlist_check;
    use db_schema::schema::waterfall_execution;
    use db_schema::schema::waterfall_step;
    use db_schema::schema::webauthn_credential;
    use db_schema::schema::workflow;
    use db_schema::schema::workflow_event;
    use db_schema::schema::workflow_request;
    let mut deleted_rows = 0;

    // First, get any business vaults related to this user and delete them.
    // If any business vaults are owned by another user vault, this will fail because of FK constraints
    let bv_ids: Vec<VaultId> = business_owner::table
        .filter(business_owner::user_vault_id.eq(&uvid))
        .select(business_owner::business_vault_id)
        .get_results(conn.conn())?;
    let v_ids = bv_ids.into_iter().chain([uvid]).collect_vec();

    // delete user data
    deleted_rows += diesel::delete(webauthn_credential::table)
        .filter(webauthn_credential::vault_id.eq_any(&v_ids))
        .execute(conn.conn())?;

    deleted_rows += diesel::delete(user_timeline::table)
        .filter(user_timeline::vault_id.eq_any(&v_ids))
        .execute(conn.conn())?;

    deleted_rows += diesel::delete(fingerprint_visit_event::table)
        .filter(fingerprint_visit_event::vault_id.eq_any(&v_ids))
        .execute(conn.conn())?;

    deleted_rows += diesel::delete(business_owner::table)
        .filter(business_owner::user_vault_id.eq_any(&v_ids))
        .execute(conn.conn())?;
    deleted_rows += diesel::delete(business_owner::table)
        .filter(business_owner::business_vault_id.eq_any(&v_ids))
        .execute(conn.conn())?;

    deleted_rows += diesel::delete(stytch_fingerprint_event::table)
        .filter(stytch_fingerprint_event::vault_id.eq_any(&v_ids))
        .execute(conn.conn())?;

    // delete auth events and device attestations
    deleted_rows += diesel::delete(auth_event::table)
        .filter(auth_event::vault_id.eq_any(&v_ids))
        .execute(conn.conn())?;

    deleted_rows += diesel::delete(apple_device_attestation::table)
        .filter(apple_device_attestation::vault_id.eq_any(&v_ids))
        .execute(conn.conn())?;

    // DataLifetimes
    {
        let dl_ids = data_lifetime::table
            .filter(data_lifetime::vault_id.eq_any(&v_ids))
            .select(data_lifetime::id);

        deleted_rows += diesel::delete(vault_dr_blob::table)
            .filter(vault_dr_blob::data_lifetime_id.eq_any(dl_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(vault_data::table)
            .filter(vault_data::lifetime_id.eq_any(dl_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(contact_info::table)
            .filter(contact_info::lifetime_id.eq_any(dl_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(document_data::table)
            .filter(document_data::lifetime_id.eq_any(dl_ids.clone()))
            .execute(conn.conn())?;

        {
            // fingerprint junctions
            let fp_ids = fingerprint_junction::table
                .filter(fingerprint_junction::lifetime_id.eq_any(dl_ids.clone()))
                .select(fingerprint_junction::fingerprint_id);

            deleted_rows += diesel::delete(fingerprint::table)
                .filter(fingerprint::id.eq_any(fp_ids.clone()))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(fingerprint_junction::table)
                .filter(fingerprint_junction::lifetime_id.eq_any(dl_ids.clone()))
                .execute(conn.conn())?;
        }

        deleted_rows += diesel::delete(data_lifetime::table)
            .filter(data_lifetime::vault_id.eq_any(&v_ids))
            .execute(conn.conn())?;
    }

    // Scoped users
    {
        let su_ids = scoped_vault::table
            .filter(scoped_vault::vault_id.eq_any(&v_ids))
            .select(scoped_vault::id);

        deleted_rows += diesel::delete(access_event::table)
            .filter(access_event::scoped_vault_id.eq_any(su_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(audit_event::table)
            .filter(audit_event::scoped_vault_id.eq_any(su_ids.clone().nullable()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(annotation::table)
            .filter(annotation::scoped_vault_id.eq_any(su_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(liveness_event::table)
            .filter(liveness_event::scoped_vault_id.eq_any(su_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(watchlist_check::table)
            .filter(watchlist_check::scoped_vault_id.eq_any(su_ids.clone()))
            .execute(conn.conn())?;

        let dr_ids = document_request::table
            .filter(document_request::scoped_vault_id.eq_any(su_ids.clone()))
            .select(document_request::id);

        // Id documents
        {
            let id_doc_ids = identity_document::table
                .filter(identity_document::request_id.eq_any(dr_ids.clone()))
                .select(identity_document::id);

            deleted_rows += diesel::delete(document_upload::table)
                .filter(document_upload::document_id.eq_any(id_doc_ids.clone()))
                .execute(conn.conn())?;

            let incode_ids = incode_verification_session::table
                .filter(incode_verification_session::identity_document_id.eq_any(id_doc_ids.clone()))
                .select(incode_verification_session::id);

            deleted_rows += diesel::delete(incode_verification_session_event::table)
                .filter(incode_verification_session_event::incode_verification_session_id.eq_any(incode_ids))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(incode_verification_session::table)
                .filter(incode_verification_session::identity_document_id.eq_any(id_doc_ids))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(identity_document::table)
                .filter(identity_document::request_id.eq_any(dr_ids))
                .execute(conn.conn())?;
        }

        deleted_rows += diesel::delete(document_request::table)
            .filter(document_request::scoped_vault_id.eq_any(su_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(billing_event::table)
            .filter(billing_event::scoped_vault_id.eq_any(su_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(fingerprint_visit_event::table)
            .filter(
                fingerprint_visit_event::scoped_vault_id
                    .eq_any(su_ids.clone().select(scoped_vault::id.nullable())),
            )
            .execute(conn.conn())?;
        let di_ids = decision_intent::table
            .filter(decision_intent::scoped_vault_id.eq_any(su_ids.clone()))
            .select(decision_intent::id);
        let we_ids = waterfall_execution::table
            .filter(waterfall_execution::decision_intent_id.eq_any(di_ids.clone()))
            .select(waterfall_execution::id);

        deleted_rows += diesel::delete(waterfall_step::table)
            .filter(waterfall_step::execution_id.eq_any(we_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(waterfall_execution::table)
            .filter(waterfall_execution::decision_intent_id.eq_any(di_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(decision_intent::table)
            .filter(decision_intent::scoped_vault_id.eq_any(su_ids.clone()))
            .execute(conn.conn())?;

        deleted_rows += diesel::delete(workflow_request::table)
            .filter(workflow_request::scoped_vault_id.eq_any(su_ids.clone()))
            .execute(conn.conn())?;

        // Rule results
        {
            let rule_set_result_ids = rule_set_result::table
                .filter(rule_set_result::scoped_vault_id.eq_any(su_ids.clone()))
                .select(rule_set_result::id);

            deleted_rows += diesel::delete(rule_result::table)
                .filter(rule_result::rule_set_result_id.eq_any(rule_set_result_ids.clone()))
                .execute(conn.conn())?;
            deleted_rows += diesel::delete(rule_set_result_risk_signal_junction::table)
                .filter(rule_set_result_risk_signal_junction::rule_set_result_id.eq_any(rule_set_result_ids))
                .execute(conn.conn())?;
            deleted_rows += diesel::delete(rule_set_result::table)
                .filter(rule_set_result::scoped_vault_id.eq_any(su_ids.clone()))
                .execute(conn.conn())?;
        }

        // Verification requests
        {
            let verification_request_ids = verification_request::table
                .filter(verification_request::scoped_vault_id.eq_any(su_ids.clone()))
                .select(verification_request::id);

            let verification_result_ids = verification_result::table
                .filter(verification_result::request_id.eq_any(verification_request_ids.clone()))
                .select(verification_result::id);

            deleted_rows += diesel::delete(onboarding_decision_verification_result_junction::table)
                .filter(
                    onboarding_decision_verification_result_junction::verification_result_id
                        .eq_any(verification_result_ids.clone()),
                )
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(risk_signal::table)
                .filter(risk_signal::verification_result_id.eq_any(verification_result_ids.clone()))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(risk_signal_group::table)
                .filter(risk_signal_group::scoped_vault_id.eq_any(su_ids.clone()))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(risk_signal::table)
                .filter(risk_signal::verification_result_id.eq_any(verification_result_ids.clone()))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(verification_result::table)
                .filter(verification_result::request_id.eq_any(verification_request_ids))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(verification_request::table)
                .filter(verification_request::scoped_vault_id.eq_any(su_ids.clone()))
                .execute(conn.conn())?;
        }

        // Workflows
        {
            let workflow_ids = workflow::table
                .filter(workflow::scoped_vault_id.eq_any(su_ids.clone()))
                .select(workflow::id);

            deleted_rows += diesel::delete(workflow_event::table)
                .filter(workflow_event::workflow_id.eq_any(workflow_ids.clone()))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(manual_review::table)
                .filter(manual_review::workflow_id.eq_any(workflow_ids.clone()))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(middesk_request::table)
                .filter(middesk_request::workflow_id.eq_any(workflow_ids.clone()))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(socure_device_session::table)
                .filter(socure_device_session::workflow_id.eq_any(workflow_ids.clone()))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(onboarding_decision::table)
                .filter(onboarding_decision::workflow_id.eq_any(workflow_ids.clone()))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(user_consent::table)
                .filter(user_consent::workflow_id.eq_any(workflow_ids))
                .execute(conn.conn())?;

            deleted_rows += diesel::delete(workflow::table)
                .filter(workflow::scoped_vault_id.eq_any(su_ids.clone()))
                .execute(conn.conn())?;
        }

        // delete scoped_users
        deleted_rows += diesel::delete(scoped_vault::table)
            .filter(scoped_vault::vault_id.eq_any(&v_ids))
            .execute(conn.conn())?;
    }

    // delete user vault
    deleted_rows += diesel::delete(vault::table)
        .filter(vault::id.eq_any(&v_ids))
        .execute(conn.conn())?;

    Ok(deleted_rows)
}
