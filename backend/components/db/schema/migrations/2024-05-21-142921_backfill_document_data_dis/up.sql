-- TODO run in prod before merging
WITH dis_to_update AS (
    select id, kind
    from document_data
    where kind in ('document.ssn_card.front.image', 'document.ssn_card.front.latest_upload', 'document.proof_of_address.front.image', 'document.proof_of_address.front.latest_upload')
    limit 10000
)
UPDATE document_data
SET kind = CASE
    WHEN dis_to_update.kind = 'document.ssn_card.front.image' THEN 'document.ssn_card.image'
    WHEN dis_to_update.kind = 'document.ssn_card.front.latest_upload' THEN 'document.ssn_card.image'
    WHEN dis_to_update.kind = 'document.proof_of_address.front.image' THEN 'document.proof_of_address.image'
    WHEN dis_to_update.kind = 'document.proof_of_address.front.latest_upload' THEN 'document.proof_of_address.image'
END
FROM dis_to_update
WHERE document_data.id = dis_to_update.id;