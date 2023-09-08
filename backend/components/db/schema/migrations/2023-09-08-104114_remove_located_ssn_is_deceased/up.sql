UPDATE risk_signal
SET reason_code = 'subject_deceased'
-- ~100 rows
WHERE reason_code in ('located_ssn_is_deceased', 'ssn_located_is_deceased');
