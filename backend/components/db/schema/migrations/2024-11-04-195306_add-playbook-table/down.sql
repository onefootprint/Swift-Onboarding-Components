ALTER TABLE ob_configuration
  DROP COLUMN playbook_id,
  DROP COLUMN deactivated_at;

DROP TABLE playbook;
