update risk_signal
set reason_code = 'phone_located_does_not_match'
where reason_code = 'phone_number_does_not_match';