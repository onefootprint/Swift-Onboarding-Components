UPDATE user_timeline
SET event = json_build_object('data', event->'data', 'kind', 'document_uploaded')
WHERE
    event->>'kind' = 'identity_document_uploaded';