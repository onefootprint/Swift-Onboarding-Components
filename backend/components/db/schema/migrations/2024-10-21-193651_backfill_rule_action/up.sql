
-- TODO: this is not correct for alpaca stepups, so we'll need to re-backfill later for them
-- it's too much of a pain to do this in this stack
CREATE OR REPLACE FUNCTION temp_create_documents_config()
RETURNS jsonb AS $$
BEGIN
  RETURN jsonb_build_object(
    'collect_selfie', true,
    'document_types_and_countries', jsonb_build_object(
      'global', jsonb_build_array(
        'id_card',
        'drivers_license',
        'passport',
        'passport_card',
        'permit',
        'visa',
        'residence_document',
        'voter_identification'
      ),
      'country_specific', '{}'::jsonb
    )
  );
END;
$$ LANGUAGE plpgsql;


with rule_instances_to_update as (
    select ri.id,
        CASE 
            -- legacy
            WHEN action = 'step_up' THEN ARRAY[
                jsonb_build_object(
                    'kind', 'identity', 
                    'data', temp_create_documents_config())]
            WHEN action = 'step_up.identity' THEN ARRAY[jsonb_build_object('kind', 'identity', 'data', temp_create_documents_config())]
            WHEN action = 'step_up.proof_of_address' THEN ARRAY[jsonb_build_object('kind', 'proof_of_address', 'data', jsonb_build_object('requires_human_review', true))]
            WHEN action = 'step_up.identity_proof_of_ssn' THEN ARRAY[
                jsonb_build_object('kind', 'proof_of_ssn', 'data', jsonb_build_object('requires_human_review', true)),
                jsonb_build_object('kind', 'identity', 'data', temp_create_documents_config())
            ]
            WHEN action = 'step_up.identity_proof_of_ssn_proof_of_address' THEN ARRAY[
                jsonb_build_object('kind', 'proof_of_ssn', 'data', jsonb_build_object('requires_human_review', true)),
                jsonb_build_object('kind', 'proof_of_address', 'data', jsonb_build_object('requires_human_review', true)),
                jsonb_build_object('kind', 'identity', 'data', temp_create_documents_config())
                ]
        END as step_up_config,
        CASE 
            WHEN action like 'step_up%' THEN 'step_up'
            ELSE action 
        END as config_kind
    from rule_instance ri
    where rule_action is null
    -- limit 5000
)

UPDATE rule_instance ri
SET rule_action = 
    CASE WHEN config_kind = 'step_up' then jsonb_build_object('kind', config_kind, 'config',  step_up_config)
    ELSE jsonb_build_object('kind', config_kind, 'config',  '{}'::jsonb)
    END
FROM rule_instances_to_update ru
WHERE ri.id = ru.id;


DROP FUNCTION IF EXISTS temp_create_documents_config();
 