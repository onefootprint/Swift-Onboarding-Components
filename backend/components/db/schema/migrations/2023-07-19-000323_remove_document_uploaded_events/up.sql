DELETE FROM user_timeline WHERE event ->> 'kind' = 'document_uploaded';;