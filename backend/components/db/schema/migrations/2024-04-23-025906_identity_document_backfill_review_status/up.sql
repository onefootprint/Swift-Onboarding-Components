WITH documents AS (
    SELECT id
    FROM identity_document
    WHERE review_status IS NULL
    ORDER BY id
    LIMIT 20000
),
documents_to_update AS (
    SELECT DISTINCT
        identity_document.id,
        identity_document.document_type,
        CASE
            WHEN identity_document.status = 'pending' THEN 'unreviewed'
            WHEN identity_document.status = 'failed' THEN 'unreviewed'


            -- All are identity_document.status = 'complete' below

            -- For identity documents, 
            WHEN document_type NOT IN ('ssn_card', 'proof_of_address', 'custom') THEN CASE
                -- If there's an IVS, the review_status is a function of the ivs.state
                WHEN ivs.id IS NOT NULL THEN CASE
                    WHEN ivs.state = 'complete' THEN 'reviewed_by_machine'
                    WHEN ivs.state in ('add_consent', 'process_id', 'process_face', 'get_onboarding_status', 'fetch_scores') THEN 'pending_machine_review'
                    ELSE 'unreviewed'
                END
                WHEN sv.is_live = 'f' THEN 'reviewed_by_machine'
            END

            WHEN document_type IN ('ssn_card', 'proof_of_address', 'custom') AND ivs.id IS NULL THEN CASE
                -- If there's no complete IVS and there's been a manual review, then it's been reviewed by a human
                WHEN mr.completed_at IS NOT NULL THEN 'reviewed_by_human'
                WHEN mr.completed_at IS NULL THEN 'pending_human_review'
            END
        END AS review_status,
        identity_document.status,
        sv.is_live,
        ivs.state = 'complete' as has_complete_ivs,
        mr.id IS NOT NULL as has_mr,
        mr.completed_at IS NOT NULL as has_completed_mr,
        identity_document._created_at
    FROM identity_document
    INNER JOIN document_request dr on dr.id = identity_document.request_id
    INNER JOIN workflow wf on dr.workflow_id = wf.id
    INNER JOIN scoped_vault sv on sv.id = wf.scoped_vault_id
    LEFT JOIN manual_review mr ON mr.scoped_vault_id = sv.id AND mr._created_at > identity_document.created_at AND mr.completed_at IS NOT NULL
    LEFT JOIN incode_verification_session ivs ON ivs.identity_document_id = identity_document.id
    -- if we re-ran the IVS, only want the most recent
    WHERE ivs.deactivated_at is null
        AND identity_document.review_status IS NULL
        AND identity_document.id IN (SELECT id FROM documents)
)
UPDATE identity_document
SET review_status = documents_to_update.review_status
FROM documents_to_update
WHERE identity_document.id = documents_to_update.id;