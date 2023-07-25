
WITH onboarding_dis AS (
    SELECT 
        scoped_vault_id, id di_id
    FROM decision_intent
    WHERE 
        kind = 'onboarding_kyc'
        AND workflow_id IS NULL
),
kyc_wfs AS (
    SELECT
        scoped_vault_id, id wf_id
    FROM workflow
    WHERE
  	    kind IN ('kyc', 'alpaca_kyc')
	    AND config->'data'->>'is_redo' = 'false'
)

UPDATE decision_intent di
SET workflow_id = k.wf_id
FROM onboarding_dis o
INNER JOIN kyc_wfs k ON o.scoped_vault_id = k.scoped_vault_id
WHERE
    di.id = o.di_id;
