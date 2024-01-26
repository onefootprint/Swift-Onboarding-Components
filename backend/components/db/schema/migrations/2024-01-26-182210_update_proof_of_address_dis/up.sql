UPDATE data_lifetime SET kind = REPLACE(kind, 'lease.', 'proof_of_address.') WHERE kind ILIKE 'document.lease.%';
UPDATE data_lifetime SET kind = REPLACE(kind, 'utility_bill.', 'proof_of_address.') WHERE kind ILIKE 'document.utility_bill.%';
UPDATE data_lifetime SET kind = REPLACE(kind, 'bank_statement.', 'proof_of_address.') WHERE kind ILIKE 'document.bank_statement.%';

UPDATE document_data SET kind = REPLACE(kind, 'lease.', 'proof_of_address.') WHERE kind ILIKE 'document.lease.%';
UPDATE document_data SET kind = REPLACE(kind, 'utility_bill.', 'proof_of_address.') WHERE kind ILIKE 'document.utility_bill.%';
UPDATE document_data SET kind = REPLACE(kind, 'bank_statement.', 'proof_of_address.') WHERE kind ILIKE 'document.bank_statement.%';

UPDATE vault_data SET kind = REPLACE(kind, 'lease.', 'proof_of_address.') WHERE kind ILIKE 'document.lease.%';
UPDATE vault_data SET kind = REPLACE(kind, 'utility_bill.', 'proof_of_address.') WHERE kind ILIKE 'document.utility_bill.%';
UPDATE vault_data SET kind = REPLACE(kind, 'bank_statement.', 'proof_of_address.') WHERE kind ILIKE 'document.bank_statement.%';

UPDATE access_event
SET targets = (
    SELECT array_agg(
        REPLACE(
            REPLACE(
                REPLACE(target, 'lease.', 'proof_of_address.'),
                'utility_bill.',
                'proof_of_address.'
            ),
            'bank_statement.',
            'proof_of_address.'
        )
    ) 
    FROM unnest(targets) as target    
)
WHERE
    array_to_string(targets, ',') ilike '%document.lease.%' OR 
    array_to_string(targets, ',') ilike '%document.utility_bill.%' OR 
    array_to_string(targets, ',') ilike '%document.bank_statement.%';