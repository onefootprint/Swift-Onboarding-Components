UPDATE tenant
SET allowed_preview_apis = ARRAY_APPEND(allowed_preview_apis, 'create_user_decision')
WHERE id = 'org_UrS3zJj1RDg3DXv3V5HUIv';