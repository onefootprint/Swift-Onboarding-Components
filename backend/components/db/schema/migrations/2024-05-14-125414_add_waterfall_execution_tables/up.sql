CREATE TABLE IF NOT EXISTS waterfall_execution (
    id text PRIMARY KEY DEFAULT prefixed_uid('we_'),
    created_at timestamptz NOT NULL,
    -- the DI this is running in, unique index
    decision_intent_id TEXT NOT NULL,
    -- tracking
    -- serialized available apis, in the ordering we want the waterfall to progress in
    available_vendor_apis TEXT[] NOT NULL,
    -- completion means success or failure, we need to load the vres to see if all error
    -- perhaps denorming error here?
    completed_at timestamptz,
    -- what is the current step the execution is handling
    -- eventually, used for if the waterfall crashes, we can load the waterfall_step row and figure out how to proceed
    -- atomically set this when writing step acition and fRCs
    -- if we are restarting, we can reset this to 0
    latest_step INTEGER NOT NULL,

    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_waterfall_execution_decision_intent_id
        FOREIGN KEY(decision_intent_id)
        REFERENCES decision_intent(id)
        DEFERRABLE INITIALLY DEFERRED

);

CREATE TABLE IF NOT EXISTS waterfall_step (
    id text PRIMARY KEY DEFAULT prefixed_uid('ws_'),
    -- fk to waterfall table
    execution_id TEXT NOT NULL,
    created_at timestamptz NOT NULL,
    vendor_api TEXT NOT NULL,
    step INTEGER NOT NULL,
    -- initially, we don't have one of these, but we'll write one
    verification_result_id TEXT,
    -- denormalized to help with querying
    verification_result_is_error BOOLEAN,
    -- we should have the rule decision made in the same transaction we write the VRes. so we're absolutely sure it comes from the correct vres
    -- ideally we'd have rule set result id here, but we RuleSetResult currently has a FK to obc, so 
    -- we can't use a dangling RSR now, we can drop this column once we move to RSR
    rules_result JSONB,
    -- the decision for this step
    action TEXT,
    -- if waterfall crashes and we want to manually re-run in /proceed, we'll mark the existing step entry as deactivated
    -- so we naturally will try again
    deactivated_at timestamptz,

    completed_at timestamptz,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_waterfall_step_execution_id
        FOREIGN KEY(execution_id)
        REFERENCES waterfall_execution(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_waterfall_step_verification_result_id
        FOREIGN KEY(verification_result_id)
        REFERENCES verification_result(id)
        DEFERRABLE INITIALLY DEFERRED
);


SELECT diesel_manage_updated_at('waterfall_execution');
SELECT diesel_manage_updated_at('waterfall_step');

CREATE INDEX IF NOT EXISTS waterfall_execution_decision_intent_id ON waterfall_execution(decision_intent_id);
CREATE INDEX IF NOT EXISTS waterfall_step_execution_id ON waterfall_step(execution_id);
CREATE INDEX IF NOT EXISTS waterfall_step_verification_result_id ON waterfall_step(verification_result_id);