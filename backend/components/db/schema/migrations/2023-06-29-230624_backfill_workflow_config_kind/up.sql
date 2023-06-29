UPDATE workflow
SET config = config || jsonb_build_object('kind', kind)
WHERE
    config->>'kind' IS NULL;