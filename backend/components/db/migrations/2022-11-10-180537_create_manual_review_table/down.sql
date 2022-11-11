DROP TABLE manual_review;

-- These are just straggler changes that were forgetten in a previous PR. Sorry!
ALTER TABLE annotation ALTER CONSTRAINT fk_annotation_scoped_user_id NOT DEFERRABLE;
ALTER TABLE annotation ALTER CONSTRAINT fk_annotation_tenant_user_id NOT DEFERRABLE;
ALTER TABLE liveness_event ALTER CONSTRAINT fk_liveness_event_insight_event_id NOT DEFERRABLE;
ALTER TABLE liveness_event ALTER CONSTRAINT fk_liveness_onboarding_id NOT DEFERRABLE;