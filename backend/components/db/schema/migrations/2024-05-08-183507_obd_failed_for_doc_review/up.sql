-- TODO remove default
ALTER TABLE onboarding_decision ADD COLUMN failed_for_doc_review BOOLEAN NOT NULL DEFAULT 'f';