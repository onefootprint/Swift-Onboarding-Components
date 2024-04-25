UPDATE manual_review 
SET kind = CASE
    WHEN review_reasons = ARRAY['custom_document'] THEN 'document_needs_review'
    WHEN review_reasons = ARRAY['proof_of_address_document'] THEN 'document_needs_review'
    WHEN review_reasons = ARRAY['proof_of_ssn_document'] THEN 'document_needs_review'
    ELSE 'rule_triggered'
END
WHERE kind IS NULL;