ALTER TABLE workflow_request ADD COLUMN config JSONB NOT NULL DEFAULT jsonb_build_object('kind', 'redo_kyc');