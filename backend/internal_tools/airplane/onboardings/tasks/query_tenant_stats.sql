select 
	  tenant,

    total__6h,
    total__7d,
    total__all,

    pass__6h,
    pass__7d,
    pass__all,

    fail__6h,
    fail__7d,
    fail__all,

    incomplete__6h,
    incomplete__7d,
    incomplete__all,

    round(100.0*pass__6h/greatest((pass__6h+fail__6h),1)) verif_rate__6h,
    round(100.0*pass__7d/greatest((pass__7d+fail__7d),1)) verif_rate__7d,
	  round(100.0*pass__all/greatest((pass__all+fail__all),1)) verif_rate__all,
    
    round(100.0*pass__6h/greatest(total__6h,1)) pass_rate__6h,
    round(100.0*pass__7d/greatest(total__7d,1)) pass_rate__7d,
    round(100.0*pass__all/greatest(total__all,1)) pass_rate__all,

    round(100.0*fail__6h/greatest(total__6h,1)) fail_rate__6h,
    round(100.0*fail__7d/greatest(total__7d,1)) fail_rate__7d,
	  round(100.0*fail__all/greatest(total__all,1)) fail_rate__all,
    
    round(100.0*incomplete__6h/greatest(total__6h,1)) incomplete_rate__6h,
    round(100.0*incomplete__7d/greatest(total__7d,1)) incomplete_rate__7d,
	  round(100.0*incomplete__all/greatest(total__all,1)) incomplete_rate__all

from (
  select
      t.name tenant,
      sum(case when wf.created_at > now() - interval '6 hours' then 1 else 0 end) total__6h,
      sum(case when wf.created_at > now() - interval '7 days' then 1 else 0 end) total__7d,
      count(*) total__all,

      sum(case when wf.status = 'pass' and wf.created_at > now() - interval '6 hours' then 1 else 0 end) pass__6h,
      sum(case when wf.status = 'pass' and wf.created_at > now() - interval '7 days' then 1 else 0 end) pass__7d,
      sum(case when wf.status = 'pass' then 1 else 0 end) pass__all,

      sum(case when wf.status = 'fail' and wf.created_at > now() - interval '6 hours' then 1 else 0 end) fail__6h,
      sum(case when wf.status = 'fail' and wf.created_at > now() - interval '7 days' then 1 else 0 end) fail__7d,
      sum(case when wf.status = 'fail' then 1 else 0 end) fail__all,

      sum(case when wf.status = 'incomplete' and wf.created_at > now() - interval '6 hours' then 1 else 0 end) incomplete__6h,
      sum(case when wf.status = 'incomplete' and wf.created_at > now() - interval '7 days' then 1 else 0 end) incomplete__7d,
      sum(case when wf.status = 'incomplete' then 1 else 0 end) incomplete__all

  from workflow wf
  inner join scoped_vault sv on wf.scoped_vault_id = sv.id
  inner join vault v on sv.vault_id = v.id
  inner join tenant t on sv.tenant_id = t.id
  where
    sv.is_live and 
    sv.tenant_id not like '_private_it_org_%' 
    and sv.tenant_id not  in ('org_hyZP3ksCvsT0AlLqMZsgrI', 'org_e2FHVfOM5Hd3Ce492o5Aat')
    and v.is_portable
  group by 1
) t
where total__7d > 0
order by 3 desc