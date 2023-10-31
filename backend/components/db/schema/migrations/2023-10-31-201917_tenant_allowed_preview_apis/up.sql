-- TODO remove default
ALTER TABLE tenant ADD COLUMN allowed_preview_apis TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Grid
UPDATE tenant
SET allowed_preview_apis = ARRAY['vault_integrity']::TEXT[]
WHERE id = 'org_AiK8peOw9mrqsb6yeHWEG8';

-- Findigs
UPDATE tenant
SET allowed_preview_apis = ARRAY['match_signals_list', 'liveness_list', 'auth_events_list', 'documents_list', 'risk_signals_list', 'reonboard_user']::TEXT[]
WHERE id = 'org_UrS3zJj1RDg3DXv3V5HUIv';

-- Apiture
UPDATE tenant
SET allowed_preview_apis = ARRAY['risk_signals_list']::TEXT[]
WHERE id = 'org_VWhEJ36DGxIgTSl8CFJOhR';