DELETE FROM billing_event WHERE ob_configuration_id IS NULL;
ALTER TABLE billing_event ALTER COLUMN ob_configuration_id SET NOT NULL;