-- TODO: run manually before deploying

-- Since we're consolidating .front.image and .front.latest_upload into a single DI, need to deactivate the .latest_upload DIs, which are written first
UPDATE data_lifetime dl
SET deactivated_seqno = other_dl.created_seqno, deactivated_at = other_dl.created_at
FROM data_lifetime other_dl
WHERE
    dl.scoped_vault_id = other_dl.scoped_vault_id AND
    dl.kind = 'document.ssn_card.front.latest_upload' AND
    other_dl.kind = 'document.ssn_card.front.image' AND
    dl.created_seqno < other_dl.created_seqno AND
    dl.deactivated_seqno IS NULL AND other_dl.deactivated_seqno IS NULL;

UPDATE data_lifetime dl
SET deactivated_seqno = other_dl.created_seqno, deactivated_at = other_dl.created_at
FROM data_lifetime other_dl
WHERE
    dl.scoped_vault_id = other_dl.scoped_vault_id AND
    dl.kind = 'document.proof_of_address.front.latest_upload' AND
    other_dl.kind = 'document.proof_of_address.front.image' AND
    dl.created_seqno < other_dl.created_seqno AND
    dl.deactivated_seqno IS NULL AND other_dl.deactivated_seqno IS NULL;


WITH dis_to_update AS (
    select id, kind
    from data_lifetime
    where kind in ('document.ssn_card.front.image', 'document.ssn_card.front.latest_upload', 'document.proof_of_address.front.image', 'document.proof_of_address.front.latest_upload')
    limit 10000
)
UPDATE data_lifetime
SET kind = CASE
    WHEN dis_to_update.kind = 'document.ssn_card.front.image' THEN 'document.ssn_card.image'
    WHEN dis_to_update.kind = 'document.ssn_card.front.latest_upload' THEN 'document.ssn_card.image'
    WHEN dis_to_update.kind = 'document.proof_of_address.front.image' THEN 'document.proof_of_address.image'
    WHEN dis_to_update.kind = 'document.proof_of_address.front.latest_upload' THEN 'document.proof_of_address.image'
END
FROM dis_to_update
WHERE data_lifetime.id = dis_to_update.id;