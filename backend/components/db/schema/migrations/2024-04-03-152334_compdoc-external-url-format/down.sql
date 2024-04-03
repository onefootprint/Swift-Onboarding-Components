UPDATE compliance_doc_submission
SET doc_data = json_build_object('kind', 'external_url', 'data', doc_data->'data'->>'url')
WHERE
	doc_data->>'kind' = 'external_url'
	AND doc_data->'data'->'url' IS NOT NULL;
