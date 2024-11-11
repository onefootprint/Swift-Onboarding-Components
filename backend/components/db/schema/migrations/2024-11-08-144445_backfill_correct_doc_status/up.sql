-- First get all documents that are either failed or pending
with all_documents as (
    select iddoc.id, workflow_id, wf.scoped_vault_id, dr.id as doc_req_id, iddoc.status as status
    from identity_document iddoc
    join document_request dr on dr.id = iddoc.request_id
    join workflow wf on wf.id = dr.workflow_id
    where iddoc.status in ('failed', 'pending')
     
),

-- for the pending ones, we check if this is the latest workflow for the user
pending_documents_to_update as (
    with pending_docs as (
        select *
        from all_documents ad
        where status = 'pending'
    ),
    latest_wf as (
        select distinct on (scoped_vault_id) scoped_vault_id, id as latest_workflow_id
        from workflow wf
        where scoped_vault_id in (select scoped_vault_id from pending_docs) 
        order by scoped_vault_id, wf.created_at desc
    )
    -- choose the ones where the latest workflow id is not the same as the 
    --workflow id associated with the document
    select pending_docs.id
    from pending_docs
    join latest_wf on latest_wf.scoped_vault_id = pending_docs.scoped_vault_id
    where latest_workflow_id != workflow_id

),
-- for the failed ones, we check if this is the latest identity document for the workflow
failed_documents_to_update as (
    with failed_docs as (
        select *
        from all_documents ad
        where status = 'failed'
    ),
    latest_iddoc as (
        select distinct on (dr.id) dr.id as doc_req_id, iddoc.id as latest_iddoc_id, scoped_vault_id
        from identity_document iddoc
        join document_request dr on dr.id = iddoc.request_id
        where dr.id in (select doc_req_id from failed_docs)
        order by dr.id, iddoc.created_at desc
    )
    select failed_docs.id 
    from failed_docs
    join latest_iddoc on latest_iddoc.scoped_vault_id = failed_docs.scoped_vault_id
    where id != latest_iddoc_id
),
docs_to_update as (
    select * from pending_documents_to_update
    union
    select * from failed_documents_to_update
)

update identity_document 
    set status = 'abandoned' where id in (select id from docs_to_update);
