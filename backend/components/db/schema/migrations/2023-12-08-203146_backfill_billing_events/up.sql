-- Make one adverse media BillingEvent for every workflow with adverse media enabled
WITH events AS (
    SELECT DISTINCT ON (workflow.scoped_vault_id)
        'adverse_media_per_user',
        workflow.decision_made_at,
        workflow.scoped_vault_id,
        ob_configuration.id
    FROM workflow
    INNER JOIN ob_configuration
        ON ob_configuration.id = ob_configuration_id
    WHERE
        decision_made_at IS NOT NULL AND
        ob_configuration.enhanced_aml -> 'data' ->> 'adverse_media' = 'true' AND
        is_live = 't'
    ORDER BY workflow.scoped_vault_id, workflow.decision_made_at ASC
)
INSERT INTO billing_event(kind, timestamp, scoped_vault_id, ob_configuration_id)
SELECT *
FROM events;

-- Make one continuous monitoring BillingEvent for every scoped vault with a watchlist check
-- In reality, we make these once per year, but we haven't been doing these for more than a year.
WITH events AS (
    SELECT DISTINCT ON (workflow.scoped_vault_id)
        'continuous_monitoring_per_year',
        workflow.decision_made_at,
        workflow.scoped_vault_id,
        ob_configuration.id
    FROM workflow
    INNER JOIN ob_configuration
        ON ob_configuration.id = ob_configuration_id
    WHERE
        decision_made_at IS NOT NULL AND
        ob_configuration.enhanced_aml ->> 'kind' = 'yes' AND
        is_live = 't'
    ORDER BY workflow.scoped_vault_id, workflow.decision_made_at ASC
)
INSERT INTO billing_event(kind, timestamp, scoped_vault_id, ob_configuration_id)
SELECT *
FROM events;