-- backfill phone number
insert into user_vault_data(_created_at, _updated_at, lifetime_id, kind, e_data)
select _created_at, _updated_at, lifetime_id, 'id.phone_number', e_e164
from phone_number;

-- for these legacy contact info rows, take the PK from the old phone_number table
insert into contact_info(id, _created_at, _updated_at, lifetime_id, is_verified, priority)
select id, _created_at, _updated_at, lifetime_id, is_verified, priority
from phone_number;

-- backfill email
insert into user_vault_data(_created_at, _updated_at, lifetime_id, kind, e_data)
select _created_at, _updated_at, lifetime_id, 'id.email', e_data
from email;

-- for these legacy contact info rows, take the PK from the old email table
-- THIS IS ACTUALLY NECESSARY in order to maintain backwards compatibility from old email verification links that have already been sent out
insert into contact_info(id, _created_at, _updated_at, lifetime_id, is_verified, priority)
select id, _created_at, _updated_at, lifetime_id, is_verified, priority
from email;