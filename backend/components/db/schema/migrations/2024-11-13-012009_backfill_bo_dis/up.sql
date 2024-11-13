-- First, clean up audit_events
-- Audit events for non-footprint tenants are all "Verifying customer identity" reason or some other batch decrypt reason. Likely that someone just checked "decrypt all" on the dashboard.
-- Decrypting BOs would only ever show the first name and last name, which we now show unenecrypted in the UI. So I think it's safe to just delete these DIs from the audit events.
-- SELECT tenant_id, count(*) FROM audit_event WHERE name in ('create_user', 'update_user_data', 'delete_user_data', 'decrypt_user_data') and metadata->'data'->'fields' ?| array['business.kyced_beneficial_owners', 'business.beneficial_owners'] group by 1;

DELETE FROM audit_event WHERE name in ('create_user', 'update_user_data', 'delete_user_data', 'decrypt_user_data') and metadata->'data'->'fields' ?| array['business.kyced_beneficial_owners', 'business.beneficial_owners'] and tenant_id = '_private_it_org_2';

-- Delete audit events that only have this one DI
DELETE FROM audit_event WHERE metadata->'data'->'fields' ?| array['business.kyced_beneficial_owners', 'business.beneficial_owners'] and jsonb_array_length(metadata->'data'->'fields') = 1;

-- Remove the BO DIs from audit events
UPDATE audit_event SET metadata = jsonb_set(metadata, '{data,fields}', (metadata->'data'->'fields')::jsonb - 'business.kyced_beneficial_owners' - 'business.beneficial_owners') WHERE metadata->'data'->'fields' ?| array['business.kyced_beneficial_owners', 'business.beneficial_owners'];




-- Next, clean up user_timeline.
-- It's safe to just remove the DIs from the list of targets. The frontend doesn't often read the list of targets and instead uses the CDOs.
-- https://github.com/onefootprint/monorepo/blob/bfb919ea3282a92fdf70cdf40bfd67d7210a8dda/frontend/apps/dashboard/src/components/entities/components/details/components/content/components/audit-trail/components/audit-trail-timeline/components/data-collected-event/data-collected-event-header.tsx#L36-L40
-- SELECT count(*) FROM user_timeline WHERE event_kind = 'data_collected' and event->'data'->'targets' ?| array['business.kyced_beneficial_owners', 'business.beneficial_owners'];

UPDATE user_timeline SET event = jsonb_set(event, '{data,targets}', (event->'data'->'targets')::jsonb - 'business.kyced_beneficial_owners' - 'business.beneficial_owners') WHERE event->'data'->'targets' ?| array['business.kyced_beneficial_owners', 'business.beneficial_owners'] AND event_kind = 'data_collected';


-- Delete vault_data and DLs. These have all already been backfilled into the newer DIs.
/*
-- Make a backup, just in case
CREATE TABLE deleted_beneficial_owner_vdr_blob_2024_11_12 AS
SELECT * FROM vault_dr_blob WHERE data_lifetime_id in (SELECT id FROM data_lifetime WHERE kind in ('business.kyced_beneficial_owners', 'business.beneficial_owners'));
CREATE TABLE deleted_beneficial_owner_vault_data_2024_11_12 AS
SELECT
    vault_data.id as vault_data_id,
    vault_data._created_at as vault_data__created_at,
    vault_data._updated_at as vault_data__updated_at,    
    vault_data.lifetime_id as vault_data_lifetime_id,
    vault_data.kind as vault_data_kind,
    vault_data.e_data as vault_data_e_data,
    vault_data.p_data as vault_data_p_data,
    vault_data.format as vault_data_format,
    data_lifetime.id as data_lifetime_id,
    data_lifetime._created_at as data_lifetime__created_at,
    data_lifetime._updated_at as data_lifetime__updated_at,
    data_lifetime.vault_id as data_lifetime_vault_id,
    data_lifetime.scoped_vault_id as data_lifetime_scoped_vault_id,
    data_lifetime.created_at as data_lifetime_created_at,
    data_lifetime.portablized_at as data_lifetime_portablized_at,
    data_lifetime.deactivated_at as data_lifetime_deactivated_at,
    data_lifetime.created_seqno as data_lifetime_created_seqno,
    data_lifetime.portablized_seqno as data_lifetime_portablized_seqno,
    data_lifetime.deactivated_seqno as data_lifetime_deactivated_seqno,
    data_lifetime.kind as data_lifetime_kind,
    data_lifetime.source as data_lifetime_source,
    data_lifetime.actor as data_lifetime_actor,
    data_lifetime.origin_id as data_lifetime_origin_id
FROM vault_data
INNER JOIN data_lifetime ON vault_data.lifetime_id = data_lifetime.id
WHERE data_lifetime.kind in ('business.kyced_beneficial_owners', 'business.beneficial_owners');
*/
-- SELECT count(*) FROM vault_data WHERE kind in ('business.kyced_beneficial_owners', 'business.beneficial_owners');
-- SELECT count(*) FROM data_lifetime WHERE kind in ('business.kyced_beneficial_owners', 'business.beneficial_owners');


DELETE FROM vault_data WHERE kind in ('business.kyced_beneficial_owners', 'business.beneficial_owners');
DELETE FROM vault_dr_blob WHERE data_lifetime_id in (SELECT id FROM data_lifetime WHERE kind in ('business.kyced_beneficial_owners', 'business.beneficial_owners'));
DELETE FROM data_lifetime WHERE kind in ('business.kyced_beneficial_owners', 'business.beneficial_owners');
