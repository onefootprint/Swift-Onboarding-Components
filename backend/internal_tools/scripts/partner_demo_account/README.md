# Partner Demo Procedure

1. Generate documents:

Run a llama model locally so we can get decently fast generation of lots of documents. Maybe it's better to use the OpenAI API for this. Not sure.
```
brew install ollama weasyprint
ollama serve
```

In another terminal:
```
ollama pull llama2-uncensored
python3 generate_data.py
```

You'll need to delete the PDFs that look bad and rerun until they all look good. The script will only re-generate files that aren't already present in the PDF output directory.

2. Upload to Google drive.

Upload all PDFs to a folder shared to everyone with the link.

Currently, the PDFs are here: https://drive.google.com/drive/folders/1XHeg1VmCHD5iZYwcNjSYpZPJiSGixD8X

List the entries using the Google Drive API explorer here: https://developers.google.com/drive/api/reference/rest/v3/files/list?apix=true

Use a query (`q`) like this one: `'1XHeg1VmCHD5iZYwcNjSYpZPJiSGixD8X' in parents`.

Copy the output to `google_drive.json`.

3. Generate demo account

Grab a dashboard token from the main Footprint dashboard, and run a command like:

```
FP_API_BASE=htp://localhost:8080 FP_TENANT_DB_TOKEN=abc123 PARTNER_TENANT_NAME="ABC Bank" python3 make_account.py
```

4. Log in and invite others to the tenant

5. Cleanup (optional)

Remove your access to all tenants with a certain name by running a command like:

```sql
UPDATE tenant_rolebinding
SET deactivated_at = NOW()
WHERE
	deactivated_at = NULL
	AND
	id IN (
		SELECT tenant_rolebinding.id FROM tenant_rolebinding
			INNER JOIN tenant_role ON tenant_rolebinding.tenant_role_id = tenant_role.id
			INNER JOIN partner_tenant ON tenant_role.partner_tenant_id = partner_tenant.id
		WHERE
			tenant_rolebinding.tenant_user_id IN (
				SELECT id FROM tenant_user WHERE email = 'ethan@onefootprint.com'
			)
			AND
			partner_tenant.name = 'ABC Bank'
	);
```
