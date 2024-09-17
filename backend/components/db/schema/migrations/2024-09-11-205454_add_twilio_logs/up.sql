CREATE TABLE twilio_message_log (
  id text PRIMARY KEY DEFAULT prefixed_uid('twilog_'),
  created_at timestamptz NOT NULL,
  updated_at timestamptz,
  message_id text not null,
  account_sid text not null,
  tenant_id text,
  vault_id text,
  status text,
  error text,

  CONSTRAINT fk_twilio_message_log_tenant_id
    FOREIGN KEY(tenant_id)
    REFERENCES tenant(id)
    DEFERRABLE INITIALLY DEFERRED,

  CONSTRAINT fk_twilio_message_log_vault_id
    FOREIGN KEY(vault_id)
    REFERENCES vault(id)
    DEFERRABLE INITIALLY DEFERRED
);

CREATE UNIQUE INDEX IF NOT EXISTS twilio_message_log_message_id ON twilio_message_log(message_id);
CREATE INDEX IF NOT EXISTS twilio_message_log_vault_id ON twilio_message_log(vault_id);
CREATE INDEX IF NOT EXISTS twilio_message_log_tenant_id ON twilio_message_log(tenant_id);