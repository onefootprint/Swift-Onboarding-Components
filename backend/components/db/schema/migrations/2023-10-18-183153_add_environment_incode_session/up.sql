ALTER TABLE incode_verification_session ADD COLUMN incode_environment TEXT;


-- backfilling
-- UPDATE incode_verification_session
-- SET incode_environment = case when svv.is_live then 'production' else 'demo' end
-- FROM incode_verification_session ivs
-- inner join identity_document id on ivs.identity_document_id = id.id
-- inner join document_request dr on id.request_id = dr.id
-- inner join scoped_vault sv on dr.scoped_vault_id = sv.id;

-- ALTER TABLE incode_verification_session ALTER COLUMN incode_environment SET NOT NULL;