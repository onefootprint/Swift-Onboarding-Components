
-- Note migration below commented out and will be run manually, but posted here for posterity
select 1;
-- -- Need the old dl.id from which the new DL is derived in order to locate the old data
-- ALTER TABLE data_lifetime ADD COLUMN temp_link_dl_id TEXT;

-- with dl_tax_ids as (
--     select dl.scoped_vault_id from data_lifetime dl
--     where kind='id.us_tax_id' and deactivated_seqno is null
-- ),
-- dls as (
--   select dl.* from data_lifetime dl
--   where dl.kind='id.ssn9' and deactivated_seqno is null and scoped_vault_id not in (select * from dl_tax_ids)
-- ),
-- new_dls as (
--     insert into data_lifetime (vault_id, scoped_vault_id, created_at, portablized_at, deactivated_at, created_seqno, portablized_seqno, deactivated_seqno, kind, source, actor, origin_id, temp_link_dl_id)
--     select 
--         dls.vault_id, 
--         dls.scoped_vault_id, 
--         dls.created_at, 
--         dls.portablized_at, 
--         dls.deactivated_at, 
--         dls.created_seqno, 
--         dls.portablized_seqno, 
--         dls.deactivated_seqno, 
--         'id.us_tax_id', 
--         dls.source, 
--         dls.actor, 
--         dls.origin_id,
--         dls.id -- use the old dl_id so we can link back
--     from dls
--     returning data_lifetime.id, data_lifetime.temp_link_dl_id
-- ),
-- new_dls_with_e_datas as (
--     select new_dls.id,vd.e_data from new_dls
--     inner join vault_data vd on vd.lifetime_id = new_dls.temp_link_dl_id
-- )
-- insert into vault_data (lifetime_id, kind, e_data, format)
-- select 
--     id, 
--     'id.us_tax_id', 
--     e_data, 
--     'string'
-- from new_dls_with_e_datas;

-- COMMIT;
-- BEGIN;

-- -- Drop the temp column
-- ALTER TABLE data_lifetime DROP COLUMN temp_link_dl_id;