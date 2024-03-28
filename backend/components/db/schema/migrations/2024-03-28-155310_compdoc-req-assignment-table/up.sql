ALTER TABLE compliance_doc_request
  DROP COLUMN assigned_to_tenant_user_id;
ALTER TABLE compliance_doc_submission
  DROP COLUMN assigned_to_partner_tenant_user_id;

CREATE TABLE compliance_doc_assignment (
  id text PRIMARY KEY DEFAULT prefixed_uid('cda_'),

  created_at timestamptz NOT NULL,
  deactivated_at timestamptz,

  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  compliance_doc_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_assignment_compliance_doc_id
    FOREIGN KEY(compliance_doc_id)
    REFERENCES compliance_doc(id)
    DEFERRABLE INITIALLY DEFERRED,

  -- Will indicate partner tenant or tenant assignment.
  kind text NOT NULL,

  -- Nullable to allow for unassignment.
  assigned_to_tenant_user_id text,
  CONSTRAINT fk_compliance_doc_assignment_assigned_to_tenant_user_id
    FOREIGN KEY(assigned_to_tenant_user_id)
    REFERENCES tenant_user(id)
    DEFERRABLE INITIALLY DEFERRED,

  assigned_by_tenant_user_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_assignment_assigned_by_tenant_user_id
    FOREIGN KEY(assigned_by_tenant_user_id)
    REFERENCES tenant_user(id)
    DEFERRABLE INITIALLY DEFERRED
);

SELECT diesel_manage_updated_at('compliance_doc_assignment');

CREATE INDEX compliance_doc_assignment_compliance_doc_id
  ON compliance_doc_assignment(compliance_doc_id);
CREATE INDEX compliance_doc_assignment_assigned_to_tenant_user_id
  ON compliance_doc_assignment(assigned_to_tenant_user_id);
CREATE INDEX compliance_doc_assignment_assigned_by_tenant_user_id
  ON compliance_doc_assignment(assigned_by_tenant_user_id);

CREATE UNIQUE INDEX compliance_doc_assignment_doc_id_kind_unique_active
  ON compliance_doc_assignment(compliance_doc_id, kind)
  WHERE deactivated_at IS NULL;
