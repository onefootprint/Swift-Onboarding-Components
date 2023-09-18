ALTER TABLE ob_configuration 
    ADD COLUMN allow_us_residents BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN allow_us_territory_residents BOOLEAN NOT NULL DEFAULT false;

-- 25K rows, maybe ok if constant time?
UPDATE ob_configuration obc
 -- we need to special case coba for this, since they _only_ want MX addresses
  SET allow_us_residents = CASE WHEN obc.tenant_id = 'org_5lwSs95mU5v3gOU9xdSaml' THEN false ELSE true END, allow_us_territory_residents = false;

-- rm default in new PR