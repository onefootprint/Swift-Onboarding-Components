INSERT INTO user_vault_data(_created_at, _updated_at, lifetime_id, kind, e_data)
SELECT _created_at, _updated_at, lifetime_id, 'custom.' || data_key, e_data
FROM kv_data;