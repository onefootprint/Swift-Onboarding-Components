-- TODO backfill these before deploying
WITH wfs AS (
    SELECT
        id,
        COALESCE(config->'data'->>'kind', 'identity') as kind,
        COALESCE(cast(config->'data'->'collect_selfie' as boolean), false) as collect_selfie,
        config
    FROM workflow
    WHERE kind = 'document'
)
UPDATE workflow
SET config = jsonb_build_object(
    'kind', 'document',
    'data', jsonb_build_object(
        'kind', wfs.kind,
        'collect_selfie', wfs.collect_selfie,
        'configs', ARRAY[
            -- document request config
            jsonb_build_object(
               'kind', wfs.kind,
               'data', CASE
                    WHEN wfs.kind = 'identity' THEN jsonb_build_object('collect_selfie', wfs.collect_selfie)
                    ELSE jsonb_build_object()
                END
            )
        ]
    )
)
FROM wfs
WHERE workflow.id = wfs.id;

UPDATE workflow_request
SET config = jsonb_build_object(
    'kind', 'document',
    'data', jsonb_build_object(
        'configs', ARRAY[
            jsonb_build_object(
                'kind', config->'data'->'kind',
                'data', CASE
                    WHEN config->'data'->>'kind' = 'identity' THEN jsonb_build_object('collect_selfie', config->'data'->'collect_selfie')
                    ELSE jsonb_build_object()
                END
            )
        ]
    )
)
WHERE config ->> 'kind' = 'id_document';