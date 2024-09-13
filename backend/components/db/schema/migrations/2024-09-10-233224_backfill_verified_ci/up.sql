-- TODO run manually before merging

ALTER TABLE contact_info ADD COLUMN backfilled_into_dl_id TEXT;

-- CREATE INDEX CONCURRENTLY contact_info_lifetime_id_idx ON contact_info(lifetime_id) WHERE backfilled_into_dl_id IS NULL AND is_otp_verified = 't';
-- CREATE INDEX CONCURRENTLY data_lifetime_scoped_vault_id_kind_idx ON data_lifetime(scoped_vault_id, kind);


with dls as (
    select
        dl.*
    from contact_info ci
    inner join data_lifetime dl on dl.id = ci.lifetime_id
    where
        ci.is_otp_verified = 't' and
        ci.backfilled_into_dl_id is null and
        dl.deactivated_seqno IS NULL and
        NOT EXISTS (
            select 1
            from data_lifetime
            where
                data_lifetime.scoped_vault_id = dl.scoped_vault_id and
                -- Protect against this user already having a verfied email/phone added by new application code
                data_lifetime.kind = case 
                    when dl.kind = 'id.email' then 'id.verified_email'
                    when dl.kind = 'id.phone_number' then 'id.verified_phone_number'
                end
        )
    limit 100000
),
new_dls_with_e_datas as (
    select
        prefixed_uid('dl_'::character varying) as new_id,
        dls.vault_id,
        dls.scoped_vault_id,
        dls.created_at,
        dls.portablized_at,
        dls.deactivated_at,
        dls.created_seqno,
        dls.portablized_seqno,
        dls.deactivated_seqno,
        dls.source,
        dls.actor,
        dls.origin_id,
        dls.id as old_id,
        case 
            when dls.kind = 'id.email' then 'id.verified_email'
            when dls.kind = 'id.phone_number' then 'id.verified_phone_number'
        end as kind,
        vd.e_data
    from dls
    inner join vault_data vd
        on vd.lifetime_id = dls.id
),
new_dls as (
    insert into data_lifetime (id, vault_id, scoped_vault_id, created_at, portablized_at, deactivated_at, created_seqno, portablized_seqno, deactivated_seqno, kind, source, actor, origin_id)
    select 
        dls.new_id,
        dls.vault_id, 
        dls.scoped_vault_id, 
        dls.created_at, 
        dls.portablized_at, 
        dls.deactivated_at, 
        -- In reality, the verified phone numbers are set at the seqno that they're verified, but for ease
        -- we'll just set it to the same as the original DL
        dls.created_seqno, 
        dls.portablized_seqno, 
        dls.deactivated_seqno, 
        dls.kind,
        dls.source, 
        dls.actor, 
        -- The origin_id here would also normally be from the original `id.verified_phone_number`, but a bit overkill given this column is just for debugging
        dls.origin_id
    from new_dls_with_e_datas dls
),
new_vds as (
    insert into vault_data (lifetime_id, kind, e_data, format)
    select 
        new_id, 
        kind,
        e_data, 
        'string'
    from new_dls_with_e_datas
)
update contact_info
set backfilled_into_dl_id = new_dls_with_e_datas.new_id
from new_dls_with_e_datas
where lifetime_id = new_dls_with_e_datas.old_id;

COMMIT;
BEGIN;

ALTER TABLE contact_info DROP COLUMN backfilled_into_dl_id;
-- DROP INDEX CONCURRENTLY data_lifetime_scoped_vault_id_kind_idx;

-- Tested with some:
-- select dl1.*, dl2.* from contact_info inner join data_lifetime dl1 on lifetime_id = dl1.id inner join data_lifetime dl2 on dl2.id = backfilled_Into_dl_id where backfilled_into_dl_id is not null;