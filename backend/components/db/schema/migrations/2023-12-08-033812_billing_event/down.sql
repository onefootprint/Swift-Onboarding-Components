DROP TABLE billing_event;

ALTER TABLE billing_profile
    DROP COLUMN adverse_media_per_user,
    DROP COLUMN continuous_monitoring_per_year;