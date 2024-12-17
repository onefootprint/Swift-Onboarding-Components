CREATE TABLE super_admin_request (
  id TEXT primary key default prefixed_uid('su_req_'),
  _created_at timestamptz not null default now(),
  _updated_at timestamptz not null default now(),    
  tenant_user_id TEXT NOT NULL,
  reason TEXT,
  insight_event_id TEXT NOT NULL,
  
  -- request details
  tenant_id TEXT not null,
  scopes JSONB[] NOT NULL,
  created_at timestamptz not null,
  expires_at timestamptz not null,

  -- response details
  responder_tenant_user_id TEXT,
  responded_at timestamptz,
  approved BOOLEAN,
  responder_insight_event_id TEXT,


  CONSTRAINT fk_super_admin_request_insight_event_id
    FOREIGN KEY (insight_event_id)
    REFERENCES insight_event (id)
    DEFERRABLE INITIALLY DEFERRED,

  CONSTRAINT fk_super_admin_request_tenant_user_id
    FOREIGN KEY (tenant_user_id)
    REFERENCES tenant_user (id)
    DEFERRABLE INITIALLY DEFERRED,

  CONSTRAINT fk_super_admin_request_responder_tenant_user_id
    FOREIGN KEY (responder_tenant_user_id)
    REFERENCES tenant_user (id)
    DEFERRABLE INITIALLY DEFERRED,

  CONSTRAINT fk_super_admin_request_tenant_id
    FOREIGN KEY (tenant_id)
    REFERENCES tenant (id)
    DEFERRABLE INITIALLY DEFERRED
);

SELECT diesel_manage_updated_at ('super_admin_request');

CREATE INDEX idx_super_admin_request_tenant_user_id ON super_admin_request(tenant_user_id); 
CREATE INDEX idx_super_admin_request_responder_tenant_user_id ON super_admin_request(responder_tenant_user_id); 
CREATE INDEX idx_super_admin_request_tenant_id ON super_admin_request(tenant_id); 
