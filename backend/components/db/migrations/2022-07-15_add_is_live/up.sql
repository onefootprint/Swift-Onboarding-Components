alter table tenant_api_keys add column is_live bool not null default true;
alter table ob_configurations add column is_live bool not null default true;
alter table onboardings add column is_live bool not null default true;
alter table user_vaults add column is_live bool not null default true;