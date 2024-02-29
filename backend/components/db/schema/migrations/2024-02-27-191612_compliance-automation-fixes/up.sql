-- Recreating affected tables from scratch since they're empty and it's easier than writing an inverse of all the changes.
DROP TABLE IF EXISTS compliance_doc_review;
DROP TABLE IF EXISTS compliance_doc_submission;
DROP TABLE IF EXISTS compliance_doc_request;
DROP TABLE IF EXISTS compliance_doc_spec;
DROP TABLE IF EXISTS tenant_compliance_partnership;

-- Represents a many-to-many relationship between FP tenants and Compliance Partner tenants.
CREATE TABLE tenant_compliance_partnership (
  id text PRIMARY KEY DEFAULT prefixed_uid('tcp_'),

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

  CONSTRAINT tenant_compliance_partnership_unique_partnership UNIQUE(tenant_id, partner_tenant_id)
);

CREATE INDEX IF NOT EXISTS tenant_compliance_partnership_tenant_id ON tenant_compliance_partnership(tenant_id);
CREATE INDEX IF NOT EXISTS tenant_compliance_partnership_partner_tenant_id ON tenant_compliance_partnership(partner_tenant_id);
SELECT diesel_manage_updated_at('tenant_compliance_partnership');

-- Represents a reusable request template. The newest spec pointing to a
-- template represents the current version.
CREATE TABLE compliance_doc_template (
  id text PRIMARY KEY DEFAULT prefixed_uid('cdt_'),

  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  -- Deactivating a template doesn't affect prior requests & submissions since
  -- request fields are read directly from compliance_doc_request rather than
  -- via join.
  deactivated_at timestamptz,

  partner_tenant_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_template_partner_tenant_id
    FOREIGN KEY(partner_tenant_id)
    REFERENCES partner_tenant(id)
    DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS compliance_doc_template_partner_tenant_id ON compliance_doc_template(partner_tenant_id);
SELECT diesel_manage_updated_at('compliance_doc_template');


-- Connects a lineage of versions for a given template.
CREATE TABLE compliance_doc_template_version (
  id text PRIMARY KEY DEFAULT prefixed_uid('cdtv_'),

  created_at timestamptz NOT NULL,
  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  created_by_partner_tenant_user_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_template_version_created_by_partner_tenant_user_id
    FOREIGN KEY(created_by_partner_tenant_user_id)
    REFERENCES tenant_user(id)
    DEFERRABLE INITIALLY DEFERRED,

  -- Connects a lineage of template_versions.
  template_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_template_version_template_id
    FOREIGN KEY(template_id)
    REFERENCES compliance_doc_template(id)
    DEFERRABLE INITIALLY DEFERRED,

  name text NOT NULL,
  description text NOT NULL
);

CREATE INDEX IF NOT EXISTS compliance_doc_template_version_created_by_partner_tenant_user_id ON compliance_doc_template_version(created_by_partner_tenant_user_id);
CREATE INDEX IF NOT EXISTS compliance_doc_template_version_template_id ON compliance_doc_template(id);
SELECT diesel_manage_updated_at('compliance_doc_template_version');


-- Represents a request from a compliance partner to a FP tenant to provide a document.
CREATE TABLE compliance_doc_request (
  id text PRIMARY KEY DEFAULT prefixed_uid('cdreq_'),

  created_at timestamptz NOT NULL,
  _created_at timestamptz NOT NULL DEFAULT NOW(),
  _updated_at timestamptz NOT NULL DEFAULT NOW(),

  -- Provides ability to cancel a request if it was submitted accidentally.
  deactivated_at timestamptz,

  -- Copied from templates at time of creation to support ad-hoc requests.
  name text NOT NULL,
  description text NOT NULL,

  -- Null if this is an ad-hoc request.
  template_version_id text,
  CONSTRAINT fk_compliance_doc_request_template_version_id
    FOREIGN KEY(template_version_id)
    REFERENCES compliance_doc_template_version(id)
    DEFERRABLE INITIALLY DEFERRED,

  tenant_compliance_partnership_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_request_tenant_compliance_partnership_id
    FOREIGN KEY(tenant_compliance_partnership_id)
    REFERENCES tenant_compliance_partnership(id)
    DEFERRABLE INITIALLY DEFERRED,

  requested_by_partner_tenant_user_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_request_requested_by_partner_tenant_user_id
    FOREIGN KEY(requested_by_partner_tenant_user_id)
    REFERENCES tenant_user(id)
    DEFERRABLE INITIALLY DEFERRED,

  -- Initially null since the tenant assigns their own user after recieving the request.
  assigned_to_tenant_user_id text,
  CONSTRAINT fk_compliance_doc_request_assigned_to_tenant_user_id
    FOREIGN KEY(assigned_to_tenant_user_id)
    REFERENCES tenant_user(id)
    DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS compliance_doc_request_template_version_id ON compliance_doc_request(template_version_id);
CREATE INDEX IF NOT EXISTS compliance_doc_request_tenant_compliance_partnership_id ON compliance_doc_request(tenant_compliance_partnership_id);
CREATE INDEX IF NOT EXISTS compliance_doc_request_requested_by_partner_tenant_user_id ON compliance_doc_request(requested_by_partner_tenant_user_id);
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

  submitted_by_tenant_user_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_submission_submitted_by_tenant_user_id
    FOREIGN KEY(submitted_by_tenant_user_id)
    REFERENCES tenant_user(id)
    DEFERRABLE INITIALLY DEFERRED,

  -- Initially null since the partner tenant assigns their own user after recieving the request.
  assigned_to_partner_tenant_user_id text,
  CONSTRAINT fk_compliance_doc_submission_assigned_to_partner_tenant_user_id
    FOREIGN KEY(assigned_to_partner_tenant_user_id)
    REFERENCES tenant_user(id)
    DEFERRABLE INITIALLY DEFERRED,

  -- Rust enum: either an external URL or an S3 URL w/ encrypted data key.
  doc_data jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS compliance_doc_submission_request_id ON compliance_doc_submission(request_id);
CREATE INDEX IF NOT EXISTS compliance_doc_submission_submitted_by_tenant_user_id ON compliance_doc_submission(submitted_by_tenant_user_id);
CREATE INDEX IF NOT EXISTS compliance_doc_submission_assigned_to_partner_tenant_user_id ON compliance_doc_submission(assigned_to_partner_tenant_user_id);
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

  reviewed_by_partner_tenant_user_id text NOT NULL,
  CONSTRAINT fk_compliance_doc_review_reviewed_by_partner_tenant_user_id
    FOREIGN KEY(reviewed_by_partner_tenant_user_id)
    REFERENCES tenant_user(id)
    DEFERRABLE INITIALLY DEFERRED,

  -- Rust enum
  decision text NOT NULL,
  note text NOT NULL
);

CREATE INDEX IF NOT EXISTS compliance_doc_review_submission_id ON compliance_doc_review(submission_id);
CREATE INDEX IF NOT EXISTS compliance_doc_review_reviewed_by_partner_tenant_user_id ON compliance_doc_review(reviewed_by_partner_tenant_user_id);
SELECT diesel_manage_updated_at('compliance_doc_review');
