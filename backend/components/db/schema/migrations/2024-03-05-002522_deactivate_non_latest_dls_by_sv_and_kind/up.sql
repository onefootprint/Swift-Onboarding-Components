with vaults_with_dupes as (
	select
		sv.id sv_id, vault.id vault_id, t.kind
	from
	(
		select
		  scoped_vault_id, kind, count(*) cnt
		from data_lifetime
		where deactivated_seqno is null
		group by 1,2
		having count(*) > 1
		limit 0 -- run manually in batches
	) t
	inner join scoped_vault sv on sv.id = t.scoped_vault_id
	inner join vault on sv.vault_id = vault.id
	for update of vault
),

latest_active_dl_by_sv_kind as (
	select
		distinct on (vwd.sv_id, vwd.kind)
		vwd.sv_id,
		vwd.kind,
		dl.id dl_id,
		dl.created_seqno dl_created_seqno,
		dl.created_at dl_created_at
	from data_lifetime dl
	inner join vaults_with_dupes vwd 
		on vwd.sv_id = dl.scoped_vault_id and vwd.kind = dl.kind 
			and dl.deactivated_seqno is null
	order by vwd.sv_id, vwd.kind, dl.created_seqno desc
)

update data_lifetime
set deactivated_seqno = dl_created_seqno, deactivated_at = dl_created_at
from latest_active_dl_by_sv_kind l
inner join data_lifetime dl
	on (l.dl_id != dl.id 
			and l.sv_id = dl.scoped_vault_id 
			and l.kind = dl.kind 
			and dl.deactivated_seqno is null
	)
where data_lifetime.id = dl.id;
