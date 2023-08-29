ALTER TABLE billing_profile
    ADD COLUMN vaults_with_non_pci TEXT,
    ADD COLUMN vaults_with_pci TEXT;