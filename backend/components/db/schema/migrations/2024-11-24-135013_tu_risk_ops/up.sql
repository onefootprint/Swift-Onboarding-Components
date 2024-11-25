ALTER TABLE tenant_user
    ADD COLUMN is_risk_ops BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE tenant_user SET is_risk_ops = TRUE WHERE email in 
('dave@onefootprint.com', 'elliott@onefootprint.com', 'alex@onefootprint.com', 'eli@onefootprint.com');
