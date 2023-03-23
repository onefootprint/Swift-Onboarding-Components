UPDATE user_timeline
SET event = json_build_object('data', event->'data', 'kind', 'identity_document_uploaded')
WHERE
    event->>'kind' = 'document_uploaded';