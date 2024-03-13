/*
    We need to lock OBC's for this backfill, but its a bit difficult to query for exactly which OBC's still need this migration run or not. (Although this migration itself is still idempotenat w.r.t an obc)
    So for ease, and to enable easy manuall running in batches, we upfront select and lock a subset of OBC's
*/
with obcs as (
    select 
        id
    from ob_configuration
    order by created_at asc
    offset 0 limit 0 -- to be set while running manually 
    for no key update 
),
rule_changes as (
  select
    obcs.id obc_id,
    ri.created_seqno seqno,
    ri.created_at at, 
    ri.actor
  from obcs
  inner join rule_instance ri on ri.ob_configuration_id = obcs.id
),
rule_edits as (
  select
    obc_id, seqno, min(at) at, (array_agg(actor))[1] actor
  from rule_changes
  group by 1,2
  order by 1,2
),
backfill_rule_sets as (
  select
    rsv.id rsv_id,
    re.obc_id,
    re.actor,
    re.seqno, 
    at,
    row_number() over (partition by re.obc_id order by re.seqno asc) version, 
    lead(re.seqno) over (partition by re.obc_id order by re.seqno asc) next_seqno, 
    lead(at) over (partition by re.obc_id order by re.seqno asc) next_at 
  from rule_edits re
  left join rule_set rsv on (re.obc_id = rsv.ob_configuration_id and re.seqno = rsv.created_seqno)
)

-- backfill new RSV's
insert into rule_set(created_at, created_seqno, deactivated_at, deactivated_seqno, version, ob_configuration_id, actor)
select at, seqno, next_at, next_seqno, version, obc_id, actor
from backfill_rule_sets
where 
    rsv_id is null;

-- update version numbers on existing RSV's to be in sync with newly backfilled RSV's
-- unfortunately annoying with PG semantics to stricly query for this on only obc's for which we just backfilled new RSV's but the data volume in ob_configuration is tiny so really not a big deal to do this global query. (and it should only return rows that are coming from this migration itself)
with rsvs_with_wrong_version as (
    select 
        rsv_id, 
        expected_version
    from 
    (
        select
            rsv.id rsv_id,
            rsv.version rsv_version,
            row_number() over (partition by rsv.ob_configuration_id order by rsv.created_seqno asc) expected_version
        from rule_set rsv
    ) t
    where 
        rsv_version != expected_version
)

update rule_set
set version = rsvs_with_wrong_version.expected_version
from rsvs_with_wrong_version
where 
    rule_set.id = rsvs_with_wrong_version.rsv_id;
