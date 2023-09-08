-- get existing RSG's with kind 'watchlist' and 'adverse_media' and get their associated risk_signals
WITH wl_am_rsgs AS (
    SELECT
        *
    FROM risk_signal_group
    WHERE kind IN ('watchlist', 'adverse_media')
),
wl_am_risk_signals AS (
    SELECT 
        rs.*, rsg.scoped_vault_id
    FROM risk_signal rs 
    INNER JOIN wl_am_rsgs rsg ON rs.risk_signal_group_id = rsg.id
),
-- insert new RSG's with kind='aml'
new_rsgs AS (
    INSERT INTO risk_signal_group(created_at, scoped_vault_id, kind)
    SELECT created_at, scoped_vault_id, 'aml' kind 
    FROM (
        -- only create 1 new RSG per scoped_vault
        -- there are no instances of 1 SV having more than 1 RSG of kind `watchlist` or `adverse_media` so 
        -- we don't need to handle multiple groups of RSG's within a single SV
        SELECT 
            scoped_vault_id,
            MIN(created_at) created_at
        FROM wl_am_rsgs 
        GROUP BY 1
    ) t
    RETURNING id, scoped_vault_id
)
-- update RSG fk on existing risk_signal's
UPDATE risk_signal rs
SET risk_signal_group_id = new_rsgs.id
FROM wl_am_risk_signals wl_am_rs
INNER JOIN new_rsgs on wl_am_rs.scoped_vault_id = new_rsgs.scoped_vault_id
WHERE rs.id = wl_am_rs.id;

with wl_am_rsgs AS (
    SELECT
        *
    FROM risk_signal_group
    WHERE kind IN ('watchlist', 'adverse_media')
)
-- delete existing WL + AM RSG's
DELETE FROM risk_signal_group
WHERE id IN (SELECT id FROM wl_am_rsgs);

