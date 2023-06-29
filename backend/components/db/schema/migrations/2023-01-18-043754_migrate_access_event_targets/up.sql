-- We changed the serialization of these data identifier variants, so clear out any access events
DELETE FROM access_event WHERE targets @> ARRAY['id_document'];
DELETE FROM access_event WHERE targets @> ARRAY['selife'];