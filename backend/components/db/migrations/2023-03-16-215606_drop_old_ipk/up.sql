DELETE FROM data_lifetime WHERE kind = 'investor_profile.employment_status';
DELETE FROM user_vault_data WHERE kind = 'investor_profile.employment_status';

DELETE FROM data_lifetime WHERE kind = 'investor_profile.employed_by_brokerage';
DELETE FROM user_vault_data WHERE kind = 'investor_profile.employed_by_brokerage';

DELETE FROM access_event WHERE targets @> ARRAY['investor_profile.employment_status'];
DELETE FROM access_event WHERE targets @> ARRAY['investor_profile.employed_by_brokerage'];

