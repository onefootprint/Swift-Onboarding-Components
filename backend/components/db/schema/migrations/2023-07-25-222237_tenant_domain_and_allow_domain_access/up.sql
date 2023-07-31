ALTER TABLE tenant
ADD COLUMN domain TEXT DEFAULT NULL;

ALTER TABLE tenant
ADD COLUMN allow_domain_access BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX tenant_domain ON tenant(domain) WHERE allow_domain_access;

WITH migrated_domain AS (
  SELECT org_id, dm FROM (values ('org_01H6PGDSBKW995JDVDB8PM9JBE','apiture.com'),('org_01H64RASDMVK1WCVCQG0SKZXYG','summit.dev'),('org_01H56KPN4PWNJ3EVXB35PY0NS2','givebutter.com'),('org_01H3J54S6B4DNP7NZNEFQZA45X','katapulte.io'),('org_01H3D3Y4DEV4EE2Z36XR9HYXCZ','adaptive.build'),('org_01H3CJ7JDKPR0PTG80RTEBH0G3','equi.com'),('org_01H306NBYJYVTN0EK3DZ7223BT','glossgenius.com'),('org_01H2R97JJH4DVM069EVTNGDB1H','getvendo.com'),('org_01H2E5RJ8BFEZ6SNZ6W7QWZ3B3','buildtrayd.com'),('org_01H18CEKP46RZQ8C47JJN9C0SV','gohopscotch.com'),('org_01H12XNJDNNJC3C8Q358S93554','thatch.ai'),('org_01H0TQ2MP10JK6GJD8VGRYFJWG','seriesfi.com'),('org_01H0JZMTA6PVKRCXBWN3J5AVZT','withglide.com'),('org_01H09AJ0FHV0QXQWA9YDBVAYG7','oscilar.com'),('org_01H06R53X09EYBM9APCMCJ5X87','datavant.com'),('org_01H05ZK2PZGXMM68XKXVMZFE0X','flexcar.com'),('org_01H02VYETG6A17PKGFZJN08RQJ','ramp.com'),('org_01H00PDFZVVT7DJ38ZMH3KRS64','findigs.com'),('org_01GZJAJPYAW7NA63YDRWZ67K5E','pipe.com'),('org_01GZFSM99N5WMTTTBGHN4D0KVJ','allocations.com'),('org_01GYD1AP380WAEP540DH85QH2X','streambird.io'),('org_01GYC7RWATSW5HWSTWGAWZR5J4','knifty.io'),('org_01GVDNF3JWQBBZKW86YGR813HS','investcomposer.com'),('org_01GSTYHYD3DGJDN378RY8WRP9M','parl.co'),('org_01GSB81S0FKHK6W740M34D1KSS','getgrid.app'),('org_01GSATMY7SBMC98N5Y2GADJ265','kinnovis.com'),('org_01GS67PB0T8F5YVDRHW4WTHE6T','yardstik.com'),('org_01GPY4M9FWXMXSZSH2QBR1AGTP','voura.com'),('org_01GP09YFW3PS9RP4QZZH692TTS','fractional.app'),('org_01GMNXP7Q1FB0TBBZC87NV34NK','nuvo.finance'),('org_01GM3Z1S9FN09QTCGBC96WD8HG','getmerit.xyz'),('org_01GKBDNVK2XV5JB0N89ACVB553','x1.co'),('org_01GFKZBEXB0GQ7SV4M0JKQH4K6','fluidbanking.com'),('org_01GFKV7G6TSZM34ED8MYAN8RXR','0xpalladium.com'),('org_01GFKTC1YQF8T3KXX5ZD2ET8SN','extra.app'),('org_01GF786JZH3CTZPPR7GXF110RN','mono.co'),('org_01GF3MPC7EY6W38CP29T1RJAK5','getallstreet.com'),('org_01GESE0697EEA2PFQRX06MJ80F','keeta.com'),('org_01G8C90Y06QR5YCNXQZ48V9ENX','onefootprint.com'),('org_01G8BBW1X9RFJ97079KG79DAR3','footprint.dev'),('org_01G3AES9PK6VDBF7P4AYYF7KY0','foo-corp.com'),('org_01G39KR1V1E52JEZV6BYNG590J','footprint.dev'))
as T (org_id, dm)
)
UPDATE tenant
SET domain = d.dm,
allow_domain_access = TRUE
FROM migrated_domain d
WHERE tenant.workos_id = d.org_id;