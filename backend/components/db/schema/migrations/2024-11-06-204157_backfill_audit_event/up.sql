-- Finishing up from https://github.com/onefootprint/monorepo/blob/master/backend/components/db/schema/migrations/2024-05-07-232728_backfill-old-dis/up.sql#L25-L39
UPDATE audit_event
set metadata = jsonb_set(
        metadata,
        '{data,fields}',
        (SELECT jsonb_agg(CASE 
            WHEN element::text = '"document.ssn_card.front.image"' THEN '"document.ssn_card.image"'::jsonb
            WHEN element::text = '"document.ssn_card.front.latest_upload"' THEN '"document.ssn_card.image"'::jsonb
            WHEN element::text = '"document.proof_of_address.front.image"' THEN '"document.proof_of_address.image"'::jsonb
            WHEN element::text = '"document.proof_of_address.front.latest_upload"' THEN '"document.proof_of_address.image"'::jsonb
            ELSE element
            END)
        FROM jsonb_array_elements(metadata->'data'->'fields') as x(element))
    )
WHERE
    name in ('create_user', 'update_user_data', 'delete_user_data', 'decrypt_user_data')
    AND metadata->'data'->'fields' ?| array['document.ssn_card.front.image', 'document.ssn_card.front.latest_upload', 'document.proof_of_address.front.image', 'document.proof_of_address.front.latest_upload']::text[]
;