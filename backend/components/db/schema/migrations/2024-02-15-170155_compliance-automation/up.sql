-- Represents a compliance partner org.
CREATE TABLE partner_tenant (
  id text PRIMARY KEY DEFAULT prefixed_uid('porg_'),
  _created_at timestamp with time zone NOT NULL DEFAULT now(),
  _updated_at timestamp with time zone NOT NULL DEFAULT now(),

  name text NOT NULL,
  public_key bytea NOT NULL,
  e_private_key bytea NOT NULL,
  supported_auth_methods text[],
  domains text[] NOT NULL
);

SELECT diesel_manage_updated_at('partner_tenant');


-- Represents a many-to-many relationship between FP tenants and Compliance Partner tenants.
CREATE TABLE tenant_compliance_partnership (
  tenant_id text NOT NULL,
  CONSTRAINT fk_tenant_compliance_partner_tenant_id
    FOREIGN KEY(tenant_id)
    REFERENCES tenant(id)
    DEFERRABLE INITIALLY DEFERRED,

  partner_tenant_id text NOT NULL,
  CONSTRAINT fk_tenant_compliance_partnership_partner_tenant_id
    FOREIGN KEY(partner_tenant_id)
    REFERENCES partner_tenant(id)
    DEFERRABLE INITIALLY DEFERRED,

  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  deactivated_at timestamptz,

  PRIMARY KEY (tenant_id, partner_tenant_id)
);

CREATE INDEX IF NOT EXISTS tenant_compliance_partnership_tenant_id ON tenant_compliance_partnership(tenant_id);
CREATE INDEX IF NOT EXISTS tenant_compliance_partnership_partner_tenant_id ON tenant_compliance_partnership(partner_tenant_id);
SELECT diesel_manage_updated_at('tenant_compliance_partnership');


-- Represents a specification for a compliance document request.
-- May be saved as a reused template or ad-hoc.
CREATE TABLE compliance_doc_spec (
  id text PRIMARY KEY DEFAULT prefixed_uid('cds_'),

  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  deactivated_at timestamptz,

  owner_partner_tenant_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_spec_owner_partner_tenant_id
    FOREIGN KEY(owner_partner_tenant_id)
    REFERENCES partner_tenant(id)
    DEFERRABLE INITIALLY DEFERRED,

  name text NOT NULL,
  description text NOT NULL,
  is_template bool NOT NULL
);

CREATE INDEX IF NOT EXISTS compliance_doc_spec_owner_partner_tenant_id ON compliance_doc_spec(owner_partner_tenant_id);
SELECT diesel_manage_updated_at('compliance_doc_spec');


-- Represents a request from a compliance partner to a FP tenant to provide a document.
CREATE TABLE compliance_doc_request (
  id text PRIMARY KEY DEFAULT prefixed_uid('cdreq_'),

  created_at timestamptz NOT NULL,
  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  -- Provides ability to cancel a request if it was submitted accidentally.
  deactivated_at timestamptz,

  requested_by_tenant_user_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_request_requested_by_tenant_user_id
    FOREIGN KEY(requested_by_tenant_user_id)
    REFERENCES tenant_user(id)
    DEFERRABLE INITIALLY DEFERRED,

  spec_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_request_spec_id
    FOREIGN KEY(spec_id)
    REFERENCES compliance_doc_spec(id)
    DEFERRABLE INITIALLY DEFERRED,

  assigned_to_tenant_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_request_assigned_to_tenant_id
    FOREIGN KEY(assigned_to_tenant_id)
    REFERENCES tenant(id)
    DEFERRABLE INITIALLY DEFERRED,

  assigned_to_tenant_user_id text,
  CONSTRAINT fk_compliance_doc_request_assigned_to_tenant_user_id
    FOREIGN KEY(assigned_to_tenant_user_id)
    REFERENCES tenant_user(id)
    DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS compliance_doc_request_requested_by_tenant_user_id ON compliance_doc_request(requested_by_tenant_user_id);
CREATE INDEX IF NOT EXISTS compliance_doc_request_spec_id ON compliance_doc_request(spec_id);
CREATE INDEX IF NOT EXISTS compliance_doc_request_asigned_to_tenant_id ON compliance_doc_request(assigned_to_tenant_id);
CREATE INDEX IF NOT EXISTS compliance_doc_request_assigned_to_tenant_user_id ON compliance_doc_request(assigned_to_tenant_user_id);
SELECT diesel_manage_updated_at('compliance_doc_request');


-- Represents fulfillment of a compliance doc request.
CREATE TABLE compliance_doc_submission (
  id text PRIMARY KEY DEFAULT prefixed_uid('cdsub_'),

  created_at timestamptz NOT NULL,
  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  request_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_submission_request_id
    FOREIGN KEY(request_id)
    REFERENCES compliance_doc_request(id)
    DEFERRABLE INITIALLY DEFERRED,

  submitted_by_tenant_user_id text,
  CONSTRAINT fk_compliance_doc_submission_submitted_by_tenant_user_id
    FOREIGN KEY(submitted_by_tenant_user_id)
    REFERENCES tenant_user(id)
    DEFERRABLE INITIALLY DEFERRED,

  s3_url text NOT NULL,
  e_data_key bytea NOT NULL
);

CREATE INDEX IF NOT EXISTS compliance_doc_submission_request_id ON compliance_doc_submission(request_id);
CREATE INDEX IF NOT EXISTS compliance_doc_submission_submitted_by_tenant_user_id ON compliance_doc_submission(submitted_by_tenant_user_id);
SELECT diesel_manage_updated_at('compliance_doc_submission');


-- Represents review of a compliance doc submission.
-- There may be multiple reviews of a single submission. The latest review for
-- a given submission represents the current review status.
CREATE TABLE compliance_doc_review (
  id text PRIMARY KEY DEFAULT prefixed_uid('cdrev_'),

  created_at timestamptz NOT NULL,
  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  submission_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_review_submission_id
    FOREIGN KEY(submission_id)
    REFERENCES compliance_doc_submission(id)
    DEFERRABLE INITIALLY DEFERRED,

  reviewed_by_tenant_user_id text,
  CONSTRAINT fk_compliance_doc_review_reviewed_by_tenant_user_id
    FOREIGN KEY(reviewed_by_tenant_user_id)
    REFERENCES tenant_user(id)
    DEFERRABLE INITIALLY DEFERRED,

  -- Rust enum
  decision text NOT NULL,
  note text NOT NULL
);

CREATE INDEX IF NOT EXISTS compliance_doc_review_submission_id ON compliance_doc_review(submission_id);
CREATE INDEX IF NOT EXISTS compliance_doc_review_reviewed_by_tenant_user_id ON compliance_doc_review(reviewed_by_tenant_user_id);
SELECT diesel_manage_updated_at('compliance_doc_review');
