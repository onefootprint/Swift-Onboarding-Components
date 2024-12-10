-------------------------------- MODULE vdr --------------------------------

EXTENDS Integers, Naturals, Sequences, FiniteSets, TLC, SequencesExt, Functions

CONSTANTS
    \* Model values
    NULL,
    LATEST_VERSION,
    VdrConfig1,
    DataIdentifiers,
    Vaults

CONSTANTS
    \* Parameters
    BlobBatchSize,
    ManifestBatchSize,
    MaxNumRequests

ASSUME
    /\ BlobBatchSize \in Nat
    /\ ManifestBatchSize \in Nat
    /\ MaxNumRequests \in Nat
    /\ MaxNumRequests > 0

NumApis == Cardinality(Vaults)

\* Modeling only one tenant & config.

\* Vault API types
\* Simplification: Only one DI per request
VaultApiRequestType == [vault: Vaults, di: DataIdentifiers, deactivate: BOOLEAN]
VaultApiRequestTypeForFixedVault(vault) == {x \in VaultApiRequestType: x.vault = vault}

Seqno == Nat
DataLifetimeId == 0..MaxNumRequests
DataLifetime == [id: DataLifetimeId, vault: Vaults, di: DataIdentifiers, created_seqno: Seqno, deactivated_seqno: {NULL} \union Seqno]
VaultVersionId == 0..MaxNumRequests
VaultVersionNum == 0..MaxNumRequests
VaultVersion == [id: VaultVersionId, vault: Vaults, seqno: Seqno, version: VaultVersionNum, backed_up_by_vdr_config: {NULL, VdrConfig1}]

\* Since we're only modeling one VDR config:
\* We model blobs simply as their corresponding DL ID, since  blob writes are idempotent w.r.t. the DL ID & content:
\* https://github.com/onefootprint/monorepo/blob/f9369c1f3597ba397e18fdece474e3d44a25f5ae/backend/components/vault_dr/src/writer.rs#L344-L346
VaultBlob == DataLifetimeId
BlobForDl(dl, _dummy_vdr_config_arg) == dl.id

\* Manifests are little more subtle:
\* We don't actually need to model DB manifests since we don't query the table. It's simply a debugging log since we don't have read access to the bucket.
\* S3 writes are idempotent for manifest.<x>.json, but not for manifest.latest.json,
\* so we have to .
S3ManifestKey == Vaults \X (VaultVersionId \union {LATEST_VERSION})
S3ManifestValue == [version: VaultVersionNum, data: SUBSET DataLifetimeId]
S3ManifestKeyForVaultVersion(vv) == <<vv.vault, vv.version>>
S3LatestManifestKeyForVaultVersion(vv) == <<vv.vault, LATEST_VERSION>>

\* Dummy: only modeling one VDR config
VaultVersionMatchesTenantIdIsLive(vv, _dummy_vdr_config) == TRUE

Ids(items) == {item.id : item \in items}

FirstN(seq, max_elements) ==
    IF Len(seq) < max_elements THEN
        seq
    ELSE
        SubSeq(seq, 1, max_elements)

(* --algorithm vdr

variables
    seqno_sequence = 0,
    num_requests_started = 0, \* Tracks when we can stop the API processes.
    api_finished = 0,
    next_dl_id = 0,
    next_vault_version_id = 0,
    db_dls = {},
    db_vault_versions = {},
    db_blobs = {},
    s3_blobs = {},
    s3_manifests = <<>>;

define
    \* Invariants
    TypeInvariant ==
        /\ seqno_sequence \in Seqno
        /\ num_requests_started \in Nat
        /\ api_finished \in 0..NumApis
        /\ next_dl_id \in DataLifetimeId
        /\ next_vault_version_id \in VaultVersionId
        /\ db_dls \subseteq DataLifetime
        /\ db_vault_versions \subseteq VaultVersion
        /\ db_blobs \subseteq VaultBlob
        /\ s3_blobs \subseteq VaultBlob
        /\ DOMAIN s3_manifests \subseteq S3ManifestKey
        /\ Range(s3_manifests) \subseteq S3ManifestValue


    VaultVersionCorrectness == Cardinality(db_vault_versions) >= Cardinality(db_dls)
    WorkerNotAheadOfApi ==
        /\ Cardinality(db_blobs) <= Cardinality(db_dls)
        /\ Cardinality({key \in DOMAIN s3_manifests : key[2] # LATEST_VERSION }) <= Cardinality(db_vault_versions)
        /\ Cardinality({key \in DOMAIN s3_manifests : key[2] = LATEST_VERSION }) <= Cardinality({vv.vault : vv \in db_vault_versions})
    NoDuplicateIds ==
        /\ Cardinality(Ids(db_dls)) = Cardinality(db_dls)
        /\ Cardinality(Ids(db_vault_versions)) = Cardinality(db_vault_versions)


    \* We can't assert this in real life via an index because we have old data
    \* that operated on multiple scoped vaults at the same seqno.
    NoDuplicateVaultVersionSeqnos ==
      Cardinality({vv.seqno : vv \in db_vault_versions}) = Cardinality(db_vault_versions)

    VaultVersionsAreMonotonicNaturals ==
      \A vault \in Vaults:
        LET vvs == {vv \in db_vault_versions: vv.vault = vault} IN
          {vv.version : vv \in vvs} = 1..Cardinality(vvs)

    VaultApiRequestsAccountedCorrectly ==
        /\ Cardinality(db_dls) <= num_requests_started \* Not equal, due to deactivations.

    S3ManifestKeyFunction == [vv \in db_vault_versions |-> S3ManifestKeyForVaultVersion(vv)]
    S3ManifestKeyFunctionIsInjective == IsInjective(S3ManifestKeyFunction)
    LatestVaultVersionsInSet(vvs) == {
        vv \in vvs:
            \A other \in vvs:
                vv.vault = other.vault => vv.version >= other.version
    }
    S3LatestManifestKeyFunction == [vv \in LatestVaultVersionsInSet(db_vault_versions) |-> S3LatestManifestKeyForVaultVersion(vv)]
    S3LatestManifestKeyFunctionIsInjective == IsInjective(S3ManifestKeyFunction)

end define;

\* maybe map by ID for client usage?
macro write_records_to_s3(records) begin
    s3_blobs := s3_blobs \union Ids(dl_batch);
end macro;

macro write_manifests_to_s3(manifests) begin
    \* manifests overrides s3_manifests for conflicting elements in domain.
    s3_manifests := manifests @@ s3_manifests;
end macro;


\* The seqno can only be incremented while holding a ScopedVault lock: https://github.com/onefootprint/monorepo/blob/2ea6bdbeb0cfc349e5cd90f28f3cb23ddafc0253/backend/components/db/core/src/models/data_lifetime.rs#L191
\* This enforces that seqno ordering is monotonic is monotonic with respect to the ordering of ScopedVault commits.
\* A consequence of the scope of locking is that seqnos imply no ordering across ScopedVaults.
\*
\* Consider the following:
\*  1. Txn_A fetches the next seqno: n.
\*  2. Txn_B fetches the next seqno: n+1.
\*  3. Txn_B takes a lock on Vault_1, reads some data, and based on that data writes a new DL_B at seqno n+1 and commits.
\*  4. Txn_A takes a lock on Vault_1, reads some data, and based on that data write a new DL_A at n and commits.
\*  5. Client reads back DL_A as being written before DL_B
\*
\* To model this simply, we atomically increment the seqno and maintain just one API writer per Vault.
\* (We're only modeling one tenant here, so a Vault is equivalent to a ScopedVault.)
fair process VaultApiInstance \in Vaults
variables
    request = NULL,
    next_seqno = 0;

begin
    HandleRequest:
        if num_requests_started < MaxNumRequests then
            \* Pre-incrementing to make this atomic.
            \* Valid since GenerateRequest can't fail.
            num_requests_started := num_requests_started + 1;

            next_seqno := seqno_sequence + 1;
            seqno_sequence := next_seqno;
        else
            goto Shutdown;
        end if;


    GenerateRequest:
        \* Sample a request.
        with r \in VaultApiRequestTypeForFixedVault(self) do
            request := r;
        end with;

        \* Atomically create DLs and VaultVersions
        with
            should_create_new_vault_version =
              \/ request.deactivate = FALSE \* New DL
              \/ \E dl \in db_dls : (dl.vault = request.vault /\ dl.di = request.di /\ dl.deactivated_seqno = NULL), \* Deactivating existing DL

            db_dls_with_deactivation = {
                \* https://github.com/onefootprint/monorepo/blob/6fa6c7c3e30e07a061edfd9ab3037aac8f58b75c/backend/components/db/core/src/models/data_lifetime.rs#L318-L322
                IF (dl.vault = request.vault /\ dl.di = request.di /\ dl.deactivated_seqno = NULL) THEN
                    [dl EXCEPT !.deactivated_seqno = next_seqno]
                ELSE
                    dl
                : dl \in db_dls
            }
        do
            if request.deactivate = FALSE then
                \* New DL
                db_dls := db_dls_with_deactivation \union {
                    [
                        id |-> next_dl_id,
                        vault |-> request.vault,
                        di |-> request.di,
                        created_seqno |-> next_seqno,
                        deactivated_seqno |-> NULL
                    ]
                };
                next_dl_id := next_dl_id + 1;
            else
                \* Deactivate DL
                db_dls := db_dls_with_deactivation;
            end if;


          \* Create VaultVersion
          if should_create_new_vault_version then
            \* https://github.com/onefootprint/monorepo/blob/a44bc1f4c1f65993fad4cd81f26fd5f62622d873/backend/components/db/core/src/models/scoped_vault_version.rs#L62-L81
            with
              existing_for_seqno = {vv \in db_vault_versions : vv.vault = request.vault /\ vv.seqno = next_seqno},
              existing_for_vault = {vv \in db_vault_versions : vv.vault = request.vault},
              vault_version_num =
                IF Cardinality(existing_for_seqno) > 0
                THEN (CHOOSE vv \in existing_for_seqno: TRUE)
                ELSE
                  IF Cardinality(existing_for_vault) > 0
                  \* Max version + 1
                  THEN (CHOOSE vv \in existing_for_vault: \A other \in (existing_for_vault \ {vv}): other.version < vv.version).version + 1
                  ELSE 1
            do
                db_vault_versions := db_vault_versions \union {
                    [
                        id |-> next_vault_version_id,
                        vault |-> request.vault,
                        seqno |-> next_seqno,
                        version |-> vault_version_num,
                        backed_up_by_vdr_config |-> NULL
                    ]
                };
                next_vault_version_id := next_vault_version_id + 1;
            end with;
          end if
        end with;


        \* Loop
        goto HandleRequest;
    Shutdown:
        api_finished := api_finished + 1;
end process;


fair+ process VdrWorker = "vdr-worker"
variables
    api_finished_at_start_of_batch = FALSE,
    vv_batch = {},
    dl_batch = {},
    complete_vv_batch = {},
    dls_for_complete_vv_batch = <<>>,
    s3_manifest_batch = <<>>;

begin
    RunBatch:
        api_finished_at_start_of_batch := api_finished = NumApis;

        \* Get a batch of vault versions that aren't written yet
        \* Only blobs and manifests associated with these VVs will be written in this run.
        GetVaultVersionBatch:
            \* Make this fast using an index on scoped_vault_version(tenant_id, is_live, config_id, seqno)
            with
                vvs_not_backed_up_by_this_config = {
                    vv \in db_vault_versions :
                        /\ VaultVersionMatchesTenantIdIsLive(vv, VdrConfig1)
                        /\ vv.backed_up_by_vdr_config # VdrConfig1
                },
                \* (Note: SVV is equivalent to VV in this spec)
                \*
                \* The sort order *does* matter here. For a SVV to be
                \* considered complete, all DLs/blobs for the vault <= svv.seqno
                \* must be written. If we choose SVVs with prerequisites that haven't
                \* been written and aren't present in the batch, the SVVs in each
                \* batch will never be considered complete. Iterating in seqno
                \* order ensures that we make progress.
                \*
                \* However, if a seqno is skipped due to out-of-order or
                \* delayed API commits (see VaultApiInstance comment block), we
                \* still don't lose consistency in VDR. The SVV will be completed
                \* in a later batch. With read-committed isolation in Postgres, we
                \* can be sure that if a SVV is skipped in one batch, there will
                \* be no greater SVV for the same vault in the same batch. This is
                \* because a SELECT sees a snapshot of the database as of the
                \* instant the query begins to run. In other words, by sorting the
                \* SVVs by seqno, we can be sure that for all vaults present in
                \* the batch, those SVVs are the minimum non-backed up SVVs for
                \* those vaults.
                \*
                \* Sorting by seqnos here does *NOT* imply that the batch
                \* represents the global minimum seqnos for un-backed up SVVs, as
                \* inflight transactions may commit SVVs with lesser seqnos.
                vv_batch_seq = FirstN(SetToSortSeq(vvs_not_backed_up_by_this_config, LAMBDA a, b: a.seqno < b.seqno), ManifestBatchSize)
            do
                vv_batch := ToSet(vv_batch_seq);
            end with;

            \* Crashing here isn't interesting since we haven't written anything.

        \* Get a batch of DLs for the vv_batch that do not have corresponding blobs.
        GetDlBatch:
            with
                \* Select DLs active at vault versions in the vv_batch that are not backed up.
                \*
                \* Normally, it's only necessary to select DLs equal to a
                \* vv_batch seqno, but some backfills may create DLs retroactively
                \* at an earlier vault version. We need to back up these
                \* retroactively added DLs as well for the VV to be completely
                \* complete in GetCompleteVaultVersionBatch.
                \*
                \* Note that DLs retroactively created and retroactively deactivated before a
                \* VV in the batch will not be backed up.
                dls_for_vv_batch_without_blobs = {
                    dl \in db_dls :
                      /\ (\E vv \in vv_batch :
                            /\ dl.vault = vv.vault
                            /\ dl.created_seqno <= vv.seqno
                            /\ (dl.deactivated_seqno = NULL \/ dl.deactivated_seqno > vv.seqno)
                         )
                      /\ ~(BlobForDl(dl, VdrConfig1) \in db_blobs)
                },
                \* The sort order *doesn't* matter here since all blobs
                \* associated with the vv_batch must be written before the
                \* manifests are eligible to be written. If the BlobBatchSize
                \* isn't large enough to finish backing up all DLs associated with
                \* the vv_batch, then unfinished vault versions will be present in
                \* the next batch, and the dl_batch will continue to make progress
                \* on the associated DLs.
                \*
                \* We arbitrarily choose to sort in descending seqno order just
                \* to make it interesting and deterministic.
                dl_batch_seq = FirstN(SetToSortSeq(dls_for_vv_batch_without_blobs, LAMBDA a, b: a.created_seqno > b.created_seqno), BlobBatchSize)
            do
                dl_batch := ToSet(dl_batch_seq);
            end with;

            \* Crashing here isn't interesting since we haven't written anything.

        WriteBlobsToS3:
            \* Either do a partial or complete write.
            if Cardinality(dl_batch) > 1 then
                either
                    \* Write the full batch
                    write_records_to_s3(dl_batch);

                    \* Simulate possible crash of the worker
                    either skip or goto Crash end either;
                or
                    \* Simulate a partial write to S3 followed by a crash:
                    \* Any single DL could be written, since we don't guarantee ordering of S3 writes.
                    \* Make the choice deterministic to reduce state space, but make the choice out of order introduce interesting failure cases.
                    write_records_to_s3(CHOOSE dl \in dl_batch: \A other \in dl_batch: dl.seqno >= other.seqno);
                    goto Crash;
                end either;
            else
                \* Write the full batch
                write_records_to_s3(dl_batch);

                \* Simulate possible crash of the worker
                either skip or goto Crash end either;
            end if;

        CommitBlobBatch:
            db_blobs := db_blobs \union Ids(dl_batch);

            \* Simulate possible crash of the worker
            either skip or goto Crash end either;


        GetCompleteVaultVersionBatch:
            \* Get vault versions from vv_batch such that:
            \*   For all data_lifetimes active at the VV, there exists a
            \*   vault_dr_blob written for this config...
           
            \*   Equivalently (and easier to express in SQL):
            \*     There does not exist a data_lifetime active at the VV such that
            \*     there does not exist a vault_dr_blob written for this config.

            complete_vv_batch := {
                vv \in vv_batch :
                    ~(\E dl \in db_dls :
                        /\ dl.vault = vv.vault
                        /\ dl.created_seqno <= vv.seqno
                        /\ (dl.deactivated_seqno = NULL \/ dl.deactivated_seqno > vv.seqno)
                        /\ ~(BlobForDl(dl, VdrConfig1) \in db_blobs)
                    )
            };

            \* Crashing here isn't interesting since we haven't written anything new.

        GetDlsForCompleteVaultVersionBatch:
            dls_for_complete_vv_batch := [
                vv \in complete_vv_batch |->
                    {
                        dl \in db_dls :
                            /\ dl.vault = vv.vault
                            /\ dl.created_seqno <= vv.seqno
                            /\ (dl.deactivated_seqno = NULL \/ dl.deactivated_seqno > vv.seqno)
                    }
            ];

            \* Crashing here isn't interesting since we haven't written anything new.

        WriteVersionedManifestsToS3:
            with
                vv_to_key = [vv \in complete_vv_batch |-> S3ManifestKeyForVaultVersion(vv)],
                key_to_vv = AntiFunction(vv_to_key), \* Valid since key function is injective
            do
                s3_manifest_batch := [
                    key \in DOMAIN key_to_vv |-> [
                        version |-> key_to_vv[key].version,
                        data |-> Ids(dls_for_complete_vv_batch[key_to_vv[key]])
                    ]
                ];
            end with;

            \* Either do a partial or complete write.
            if Cardinality(DOMAIN s3_manifest_batch) > 1 then
                either
                    \* Write the full batch
                    write_manifests_to_s3(s3_manifest_batch);

                    \* Simulate possible crash of the worker
                    either skip or goto Crash end either;
                or
                    \* Simulate a partial write to S3 followed by a crash:
                    \* Any single manifest could be written, since we don't guarantee ordering of S3 writes.
                   with
                        key = CHOOSE key \in DOMAIN s3_manifest_batch: \A other \in DOMAIN s3_manifest_batch: key[2] = LATEST_VERSION \/ key[2] >= other[2]
                    do
                        write_manifests_to_s3(key :> s3_manifest_batch[key]);
                    end with;

                    goto Crash;
                end either;
            else
                \* Write the full batch
                write_manifests_to_s3(s3_manifest_batch);

                \* Simulate possible crash of the worker
                either skip or goto Crash end either;
            end if;

        WriteLatestManifestsToS3:
            \* We write latest manifests after the batch of unversioned manifests was successfully written for causal ordering.
            \* manifest.latest.json with version V is only written if the all manifest.<x>.json have been successfully written for 1 <= x <= V.
            with
                latest_version_vvs = LatestVaultVersionsInSet(complete_vv_batch),
                latest_vv_to_key = [vv \in latest_version_vvs |-> S3LatestManifestKeyForVaultVersion(vv)],
                latest_key_to_vv = AntiFunction(latest_vv_to_key) \* Valid since latest key function is injective for a domain with no duplicate vaults.
            do
                s3_manifest_batch := [
                    key \in DOMAIN latest_key_to_vv |-> [
                        version |-> latest_key_to_vv[key].version,
                        data |-> Ids(dls_for_complete_vv_batch[latest_key_to_vv[key]])
                    ]
                ];
            end with;

            \* Either do a partial or complete write.
            if Cardinality(DOMAIN s3_manifest_batch) > 1 then
                either
                    \* Write the full batch
                    write_manifests_to_s3(s3_manifest_batch);

                    \* Simulate possible crash of the worker
                    either skip or goto Crash end either;
                or
                    \* Simulate a partial write to S3 followed by a crash:
                    \* Any single manifest could be written, since we don't guarantee ordering of S3 writes.
                    with
                        key \in DOMAIN s3_manifest_batch
                    do
                        write_manifests_to_s3(key :> s3_manifest_batch[key]);
                    end with;

                    goto Crash;
                end either;
            else
                \* Write the full batch
                write_manifests_to_s3(s3_manifest_batch);

                \* Simulate possible crash of the worker
                either skip or goto Crash end either;
            end if;

        CommitManifests:
            \* We don't need to model writes to vault_dr_manifest since they aren't queried.

            \* TODO: implement IRL
            db_vault_versions := {
                IF vv \in complete_vv_batch
                THEN [vv EXCEPT !.backed_up_by_vdr_config = VdrConfig1]
                ELSE vv
                :
                vv \in db_vault_versions
            };

            \* Simulate possible crash of the worker
            either skip or goto Crash end either;


        LoopOrEnd:
            \* Allow the VDR worker to terminate if there is no more work to do.
            if
                /\ api_finished_at_start_of_batch
                /\ Cardinality(vv_batch) = 0
            then
                goto Shutdown;
            else
                goto RunBatch;
            end if;

    Crash:
        \* Simulate restart.
        goto RunBatch;

    Shutdown:
        skip
end process;

end algorithm; *)


\* BEGIN TRANSLATION (chksum(pcal) = "f6148580" /\ chksum(tla) = "1d636d23")
\* Label Shutdown of process VaultApiInstance at line 247 col 9 changed to Shutdown_
VARIABLES seqno_sequence, num_requests_started, api_finished, next_dl_id, 
          next_vault_version_id, db_dls, db_vault_versions, db_blobs, 
          s3_blobs, s3_manifests, pc

(* define statement *)
TypeInvariant ==
    /\ seqno_sequence \in Seqno
    /\ num_requests_started \in Nat
    /\ api_finished \in 0..NumApis
    /\ next_dl_id \in DataLifetimeId
    /\ next_vault_version_id \in VaultVersionId
    /\ db_dls \subseteq DataLifetime
    /\ db_vault_versions \subseteq VaultVersion
    /\ db_blobs \subseteq VaultBlob
    /\ s3_blobs \subseteq VaultBlob
    /\ DOMAIN s3_manifests \subseteq S3ManifestKey
    /\ Range(s3_manifests) \subseteq S3ManifestValue


VaultVersionCorrectness == Cardinality(db_vault_versions) >= Cardinality(db_dls)
WorkerNotAheadOfApi ==
    /\ Cardinality(db_blobs) <= Cardinality(db_dls)
    /\ Cardinality({key \in DOMAIN s3_manifests : key[2] # LATEST_VERSION }) <= Cardinality(db_vault_versions)
    /\ Cardinality({key \in DOMAIN s3_manifests : key[2] = LATEST_VERSION }) <= Cardinality({vv.vault : vv \in db_vault_versions})
NoDuplicateIds ==
    /\ Cardinality(Ids(db_dls)) = Cardinality(db_dls)
    /\ Cardinality(Ids(db_vault_versions)) = Cardinality(db_vault_versions)




NoDuplicateVaultVersionSeqnos ==
  Cardinality({vv.seqno : vv \in db_vault_versions}) = Cardinality(db_vault_versions)

VaultVersionsAreMonotonicNaturals ==
  \A vault \in Vaults:
    LET vvs == {vv \in db_vault_versions: vv.vault = vault} IN
      {vv.version : vv \in vvs} = 1..Cardinality(vvs)

VaultApiRequestsAccountedCorrectly ==
    /\ Cardinality(db_dls) <= num_requests_started

S3ManifestKeyFunction == [vv \in db_vault_versions |-> S3ManifestKeyForVaultVersion(vv)]
S3ManifestKeyFunctionIsInjective == IsInjective(S3ManifestKeyFunction)
LatestVaultVersionsInSet(vvs) == {
    vv \in vvs:
        \A other \in vvs:
            vv.vault = other.vault => vv.version >= other.version
}
S3LatestManifestKeyFunction == [vv \in LatestVaultVersionsInSet(db_vault_versions) |-> S3LatestManifestKeyForVaultVersion(vv)]
S3LatestManifestKeyFunctionIsInjective == IsInjective(S3ManifestKeyFunction)

VARIABLES request, next_seqno, api_finished_at_start_of_batch, vv_batch, 
          dl_batch, complete_vv_batch, dls_for_complete_vv_batch, 
          s3_manifest_batch

vars == << seqno_sequence, num_requests_started, api_finished, next_dl_id, 
           next_vault_version_id, db_dls, db_vault_versions, db_blobs, 
           s3_blobs, s3_manifests, pc, request, next_seqno, 
           api_finished_at_start_of_batch, vv_batch, dl_batch, 
           complete_vv_batch, dls_for_complete_vv_batch, s3_manifest_batch >>

ProcSet == (Vaults) \cup {"vdr-worker"}

Init == (* Global variables *)
        /\ seqno_sequence = 0
        /\ num_requests_started = 0
        /\ api_finished = 0
        /\ next_dl_id = 0
        /\ next_vault_version_id = 0
        /\ db_dls = {}
        /\ db_vault_versions = {}
        /\ db_blobs = {}
        /\ s3_blobs = {}
        /\ s3_manifests = <<>>
        (* Process VaultApiInstance *)
        /\ request = [self \in Vaults |-> NULL]
        /\ next_seqno = [self \in Vaults |-> 0]
        (* Process VdrWorker *)
        /\ api_finished_at_start_of_batch = FALSE
        /\ vv_batch = {}
        /\ dl_batch = {}
        /\ complete_vv_batch = {}
        /\ dls_for_complete_vv_batch = <<>>
        /\ s3_manifest_batch = <<>>
        /\ pc = [self \in ProcSet |-> CASE self \in Vaults -> "HandleRequest"
                                        [] self = "vdr-worker" -> "RunBatch"]

HandleRequest(self) == /\ pc[self] = "HandleRequest"
                       /\ IF num_requests_started < MaxNumRequests
                             THEN /\ num_requests_started' = num_requests_started + 1
                                  /\ next_seqno' = [next_seqno EXCEPT ![self] = seqno_sequence + 1]
                                  /\ seqno_sequence' = next_seqno'[self]
                                  /\ pc' = [pc EXCEPT ![self] = "GenerateRequest"]
                             ELSE /\ pc' = [pc EXCEPT ![self] = "Shutdown_"]
                                  /\ UNCHANGED << seqno_sequence, 
                                                  num_requests_started, 
                                                  next_seqno >>
                       /\ UNCHANGED << api_finished, next_dl_id, 
                                       next_vault_version_id, db_dls, 
                                       db_vault_versions, db_blobs, s3_blobs, 
                                       s3_manifests, request, 
                                       api_finished_at_start_of_batch, 
                                       vv_batch, dl_batch, complete_vv_batch, 
                                       dls_for_complete_vv_batch, 
                                       s3_manifest_batch >>

GenerateRequest(self) == /\ pc[self] = "GenerateRequest"
                         /\ \E r \in VaultApiRequestTypeForFixedVault(self):
                              request' = [request EXCEPT ![self] = r]
                         /\ LET should_create_new_vault_version == \/ request'[self].deactivate = FALSE
                                                                   \/ \E dl \in db_dls : (dl.vault = request'[self].vault /\ dl.di = request'[self].di /\ dl.deactivated_seqno = NULL) IN
                              LET db_dls_with_deactivation ==                            {
                                                              
                                                                  IF (dl.vault = request'[self].vault /\ dl.di = request'[self].di /\ dl.deactivated_seqno = NULL) THEN
                                                                      [dl EXCEPT !.deactivated_seqno = next_seqno[self]]
                                                                  ELSE
                                                                      dl
                                                                  : dl \in db_dls
                                                              } IN
                                /\ IF request'[self].deactivate = FALSE
                                      THEN /\ db_dls' = (          db_dls_with_deactivation \union {
                                                             [
                                                                 id |-> next_dl_id,
                                                                 vault |-> request'[self].vault,
                                                                 di |-> request'[self].di,
                                                                 created_seqno |-> next_seqno[self],
                                                                 deactivated_seqno |-> NULL
                                                             ]
                                                         })
                                           /\ next_dl_id' = next_dl_id + 1
                                      ELSE /\ db_dls' = db_dls_with_deactivation
                                           /\ UNCHANGED next_dl_id
                                /\ IF should_create_new_vault_version
                                      THEN /\ LET existing_for_seqno == {vv \in db_vault_versions : vv.vault = request'[self].vault /\ vv.seqno = next_seqno[self]} IN
                                                LET existing_for_vault == {vv \in db_vault_versions : vv.vault = request'[self].vault} IN
                                                  LET vault_version_num == IF Cardinality(existing_for_seqno) > 0
                                                                           THEN (CHOOSE vv \in existing_for_seqno: TRUE)
                                                                           ELSE
                                                                             IF Cardinality(existing_for_vault) > 0
                                                                           
                                                                             THEN (CHOOSE vv \in existing_for_vault: \A other \in (existing_for_vault \ {vv}): other.version < vv.version).version + 1
                                                                             ELSE 1 IN
                                                    /\ db_vault_versions' = (                     db_vault_versions \union {
                                                                                 [
                                                                                     id |-> next_vault_version_id,
                                                                                     vault |-> request'[self].vault,
                                                                                     seqno |-> next_seqno[self],
                                                                                     version |-> vault_version_num,
                                                                                     backed_up_by_vdr_config |-> NULL
                                                                                 ]
                                                                             })
                                                    /\ next_vault_version_id' = next_vault_version_id + 1
                                      ELSE /\ TRUE
                                           /\ UNCHANGED << next_vault_version_id, 
                                                           db_vault_versions >>
                         /\ pc' = [pc EXCEPT ![self] = "HandleRequest"]
                         /\ UNCHANGED << seqno_sequence, num_requests_started, 
                                         api_finished, db_blobs, s3_blobs, 
                                         s3_manifests, next_seqno, 
                                         api_finished_at_start_of_batch, 
                                         vv_batch, dl_batch, complete_vv_batch, 
                                         dls_for_complete_vv_batch, 
                                         s3_manifest_batch >>

Shutdown_(self) == /\ pc[self] = "Shutdown_"
                   /\ api_finished' = api_finished + 1
                   /\ pc' = [pc EXCEPT ![self] = "Done"]
                   /\ UNCHANGED << seqno_sequence, num_requests_started, 
                                   next_dl_id, next_vault_version_id, db_dls, 
                                   db_vault_versions, db_blobs, s3_blobs, 
                                   s3_manifests, request, next_seqno, 
                                   api_finished_at_start_of_batch, vv_batch, 
                                   dl_batch, complete_vv_batch, 
                                   dls_for_complete_vv_batch, 
                                   s3_manifest_batch >>

VaultApiInstance(self) == HandleRequest(self) \/ GenerateRequest(self)
                             \/ Shutdown_(self)

RunBatch == /\ pc["vdr-worker"] = "RunBatch"
            /\ api_finished_at_start_of_batch' = (api_finished = NumApis)
            /\ pc' = [pc EXCEPT !["vdr-worker"] = "GetVaultVersionBatch"]
            /\ UNCHANGED << seqno_sequence, num_requests_started, api_finished, 
                            next_dl_id, next_vault_version_id, db_dls, 
                            db_vault_versions, db_blobs, s3_blobs, 
                            s3_manifests, request, next_seqno, vv_batch, 
                            dl_batch, complete_vv_batch, 
                            dls_for_complete_vv_batch, s3_manifest_batch >>

GetVaultVersionBatch == /\ pc["vdr-worker"] = "GetVaultVersionBatch"
                        /\ LET vvs_not_backed_up_by_this_config ==                                    {
                                                                       vv \in db_vault_versions :
                                                                           /\ VaultVersionMatchesTenantIdIsLive(vv, VdrConfig1)
                                                                           /\ vv.backed_up_by_vdr_config # VdrConfig1
                                                                   } IN
                             LET vv_batch_seq == FirstN(SetToSortSeq(vvs_not_backed_up_by_this_config, LAMBDA a, b: a.seqno < b.seqno), ManifestBatchSize) IN
                               vv_batch' = ToSet(vv_batch_seq)
                        /\ pc' = [pc EXCEPT !["vdr-worker"] = "GetDlBatch"]
                        /\ UNCHANGED << seqno_sequence, num_requests_started, 
                                        api_finished, next_dl_id, 
                                        next_vault_version_id, db_dls, 
                                        db_vault_versions, db_blobs, s3_blobs, 
                                        s3_manifests, request, next_seqno, 
                                        api_finished_at_start_of_batch, 
                                        dl_batch, complete_vv_batch, 
                                        dls_for_complete_vv_batch, 
                                        s3_manifest_batch >>

GetDlBatch == /\ pc["vdr-worker"] = "GetDlBatch"
              /\ LET dls_for_vv_batch_without_blobs ==                                  {
                                                           dl \in db_dls :
                                                             /\ (\E vv \in vv_batch :
                                                                   /\ dl.vault = vv.vault
                                                                   /\ dl.created_seqno <= vv.seqno
                                                                   /\ (dl.deactivated_seqno = NULL \/ dl.deactivated_seqno > vv.seqno)
                                                                )
                                                             /\ ~(BlobForDl(dl, VdrConfig1) \in db_blobs)
                                                       } IN
                   LET dl_batch_seq == FirstN(SetToSortSeq(dls_for_vv_batch_without_blobs, LAMBDA a, b: a.created_seqno > b.created_seqno), BlobBatchSize) IN
                     dl_batch' = ToSet(dl_batch_seq)
              /\ pc' = [pc EXCEPT !["vdr-worker"] = "WriteBlobsToS3"]
              /\ UNCHANGED << seqno_sequence, num_requests_started, 
                              api_finished, next_dl_id, next_vault_version_id, 
                              db_dls, db_vault_versions, db_blobs, s3_blobs, 
                              s3_manifests, request, next_seqno, 
                              api_finished_at_start_of_batch, vv_batch, 
                              complete_vv_batch, dls_for_complete_vv_batch, 
                              s3_manifest_batch >>

WriteBlobsToS3 == /\ pc["vdr-worker"] = "WriteBlobsToS3"
                  /\ IF Cardinality(dl_batch) > 1
                        THEN /\ \/ /\ s3_blobs' = (s3_blobs \union Ids(dl_batch))
                                   /\ \/ /\ TRUE
                                         /\ pc' = [pc EXCEPT !["vdr-worker"] = "CommitBlobBatch"]
                                      \/ /\ pc' = [pc EXCEPT !["vdr-worker"] = "Crash"]
                                \/ /\ s3_blobs' = (s3_blobs \union Ids(dl_batch))
                                   /\ pc' = [pc EXCEPT !["vdr-worker"] = "Crash"]
                        ELSE /\ s3_blobs' = (s3_blobs \union Ids(dl_batch))
                             /\ \/ /\ TRUE
                                   /\ pc' = [pc EXCEPT !["vdr-worker"] = "CommitBlobBatch"]
                                \/ /\ pc' = [pc EXCEPT !["vdr-worker"] = "Crash"]
                  /\ UNCHANGED << seqno_sequence, num_requests_started, 
                                  api_finished, next_dl_id, 
                                  next_vault_version_id, db_dls, 
                                  db_vault_versions, db_blobs, s3_manifests, 
                                  request, next_seqno, 
                                  api_finished_at_start_of_batch, vv_batch, 
                                  dl_batch, complete_vv_batch, 
                                  dls_for_complete_vv_batch, s3_manifest_batch >>

CommitBlobBatch == /\ pc["vdr-worker"] = "CommitBlobBatch"
                   /\ db_blobs' = (db_blobs \union Ids(dl_batch))
                   /\ \/ /\ TRUE
                         /\ pc' = [pc EXCEPT !["vdr-worker"] = "GetCompleteVaultVersionBatch"]
                      \/ /\ pc' = [pc EXCEPT !["vdr-worker"] = "Crash"]
                   /\ UNCHANGED << seqno_sequence, num_requests_started, 
                                   api_finished, next_dl_id, 
                                   next_vault_version_id, db_dls, 
                                   db_vault_versions, s3_blobs, s3_manifests, 
                                   request, next_seqno, 
                                   api_finished_at_start_of_batch, vv_batch, 
                                   dl_batch, complete_vv_batch, 
                                   dls_for_complete_vv_batch, 
                                   s3_manifest_batch >>

GetCompleteVaultVersionBatch == /\ pc["vdr-worker"] = "GetCompleteVaultVersionBatch"
                                /\ complete_vv_batch' =                      {
                                                            vv \in vv_batch :
                                                                ~(\E dl \in db_dls :
                                                                    /\ dl.vault = vv.vault
                                                                    /\ dl.created_seqno <= vv.seqno
                                                                    /\ (dl.deactivated_seqno = NULL \/ dl.deactivated_seqno > vv.seqno)
                                                                    /\ ~(BlobForDl(dl, VdrConfig1) \in db_blobs)
                                                                )
                                                        }
                                /\ pc' = [pc EXCEPT !["vdr-worker"] = "GetDlsForCompleteVaultVersionBatch"]
                                /\ UNCHANGED << seqno_sequence, 
                                                num_requests_started, 
                                                api_finished, next_dl_id, 
                                                next_vault_version_id, db_dls, 
                                                db_vault_versions, db_blobs, 
                                                s3_blobs, s3_manifests, 
                                                request, next_seqno, 
                                                api_finished_at_start_of_batch, 
                                                vv_batch, dl_batch, 
                                                dls_for_complete_vv_batch, 
                                                s3_manifest_batch >>

GetDlsForCompleteVaultVersionBatch == /\ pc["vdr-worker"] = "GetDlsForCompleteVaultVersionBatch"
                                      /\ dls_for_complete_vv_batch' =                              [
                                                                          vv \in complete_vv_batch |->
                                                                              {
                                                                                  dl \in db_dls :
                                                                                      /\ dl.vault = vv.vault
                                                                                      /\ dl.created_seqno <= vv.seqno
                                                                                      /\ (dl.deactivated_seqno = NULL \/ dl.deactivated_seqno > vv.seqno)
                                                                              }
                                                                      ]
                                      /\ pc' = [pc EXCEPT !["vdr-worker"] = "WriteVersionedManifestsToS3"]
                                      /\ UNCHANGED << seqno_sequence, 
                                                      num_requests_started, 
                                                      api_finished, next_dl_id, 
                                                      next_vault_version_id, 
                                                      db_dls, 
                                                      db_vault_versions, 
                                                      db_blobs, s3_blobs, 
                                                      s3_manifests, request, 
                                                      next_seqno, 
                                                      api_finished_at_start_of_batch, 
                                                      vv_batch, dl_batch, 
                                                      complete_vv_batch, 
                                                      s3_manifest_batch >>

WriteVersionedManifestsToS3 == /\ pc["vdr-worker"] = "WriteVersionedManifestsToS3"
                               /\ LET vv_to_key == [vv \in complete_vv_batch |-> S3ManifestKeyForVaultVersion(vv)] IN
                                    LET key_to_vv == AntiFunction(vv_to_key) IN
                                      s3_manifest_batch' =                      [
                                                               key \in DOMAIN key_to_vv |-> [
                                                                   version |-> key_to_vv[key].version,
                                                                   data |-> Ids(dls_for_complete_vv_batch[key_to_vv[key]])
                                                               ]
                                                           ]
                               /\ IF Cardinality(DOMAIN s3_manifest_batch') > 1
                                     THEN /\ \/ /\ s3_manifests' = s3_manifest_batch' @@ s3_manifests
                                                /\ \/ /\ TRUE
                                                      /\ pc' = [pc EXCEPT !["vdr-worker"] = "WriteLatestManifestsToS3"]
                                                   \/ /\ pc' = [pc EXCEPT !["vdr-worker"] = "Crash"]
                                             \/ /\ LET key == CHOOSE key \in DOMAIN s3_manifest_batch': \A other \in DOMAIN s3_manifest_batch': key[2] = LATEST_VERSION \/ key[2] >= other[2] IN
                                                     s3_manifests' = (key :> s3_manifest_batch'[key]) @@ s3_manifests
                                                /\ pc' = [pc EXCEPT !["vdr-worker"] = "Crash"]
                                     ELSE /\ s3_manifests' = s3_manifest_batch' @@ s3_manifests
                                          /\ \/ /\ TRUE
                                                /\ pc' = [pc EXCEPT !["vdr-worker"] = "WriteLatestManifestsToS3"]
                                             \/ /\ pc' = [pc EXCEPT !["vdr-worker"] = "Crash"]
                               /\ UNCHANGED << seqno_sequence, 
                                               num_requests_started, 
                                               api_finished, next_dl_id, 
                                               next_vault_version_id, db_dls, 
                                               db_vault_versions, db_blobs, 
                                               s3_blobs, request, next_seqno, 
                                               api_finished_at_start_of_batch, 
                                               vv_batch, dl_batch, 
                                               complete_vv_batch, 
                                               dls_for_complete_vv_batch >>

WriteLatestManifestsToS3 == /\ pc["vdr-worker"] = "WriteLatestManifestsToS3"
                            /\ LET latest_version_vvs == LatestVaultVersionsInSet(complete_vv_batch) IN
                                 LET latest_vv_to_key == [vv \in latest_version_vvs |-> S3LatestManifestKeyForVaultVersion(vv)] IN
                                   LET latest_key_to_vv == AntiFunction(latest_vv_to_key) IN
                                     s3_manifest_batch' =                      [
                                                              key \in DOMAIN latest_key_to_vv |-> [
                                                                  version |-> latest_key_to_vv[key].version,
                                                                  data |-> Ids(dls_for_complete_vv_batch[latest_key_to_vv[key]])
                                                              ]
                                                          ]
                            /\ IF Cardinality(DOMAIN s3_manifest_batch') > 1
                                  THEN /\ \/ /\ s3_manifests' = s3_manifest_batch' @@ s3_manifests
                                             /\ \/ /\ TRUE
                                                   /\ pc' = [pc EXCEPT !["vdr-worker"] = "CommitManifests"]
                                                \/ /\ pc' = [pc EXCEPT !["vdr-worker"] = "Crash"]
                                          \/ /\ \E key \in DOMAIN s3_manifest_batch':
                                                  s3_manifests' = (key :> s3_manifest_batch'[key]) @@ s3_manifests
                                             /\ pc' = [pc EXCEPT !["vdr-worker"] = "Crash"]
                                  ELSE /\ s3_manifests' = s3_manifest_batch' @@ s3_manifests
                                       /\ \/ /\ TRUE
                                             /\ pc' = [pc EXCEPT !["vdr-worker"] = "CommitManifests"]
                                          \/ /\ pc' = [pc EXCEPT !["vdr-worker"] = "Crash"]
                            /\ UNCHANGED << seqno_sequence, 
                                            num_requests_started, api_finished, 
                                            next_dl_id, next_vault_version_id, 
                                            db_dls, db_vault_versions, 
                                            db_blobs, s3_blobs, request, 
                                            next_seqno, 
                                            api_finished_at_start_of_batch, 
                                            vv_batch, dl_batch, 
                                            complete_vv_batch, 
                                            dls_for_complete_vv_batch >>

CommitManifests == /\ pc["vdr-worker"] = "CommitManifests"
                   /\ db_vault_versions' =                      {
                                               IF vv \in complete_vv_batch
                                               THEN [vv EXCEPT !.backed_up_by_vdr_config = VdrConfig1]
                                               ELSE vv
                                               :
                                               vv \in db_vault_versions
                                           }
                   /\ \/ /\ TRUE
                         /\ pc' = [pc EXCEPT !["vdr-worker"] = "LoopOrEnd"]
                      \/ /\ pc' = [pc EXCEPT !["vdr-worker"] = "Crash"]
                   /\ UNCHANGED << seqno_sequence, num_requests_started, 
                                   api_finished, next_dl_id, 
                                   next_vault_version_id, db_dls, db_blobs, 
                                   s3_blobs, s3_manifests, request, next_seqno, 
                                   api_finished_at_start_of_batch, vv_batch, 
                                   dl_batch, complete_vv_batch, 
                                   dls_for_complete_vv_batch, 
                                   s3_manifest_batch >>

LoopOrEnd == /\ pc["vdr-worker"] = "LoopOrEnd"
             /\ IF /\ api_finished_at_start_of_batch
                   /\ Cardinality(vv_batch) = 0
                   THEN /\ pc' = [pc EXCEPT !["vdr-worker"] = "Shutdown"]
                   ELSE /\ pc' = [pc EXCEPT !["vdr-worker"] = "RunBatch"]
             /\ UNCHANGED << seqno_sequence, num_requests_started, 
                             api_finished, next_dl_id, next_vault_version_id, 
                             db_dls, db_vault_versions, db_blobs, s3_blobs, 
                             s3_manifests, request, next_seqno, 
                             api_finished_at_start_of_batch, vv_batch, 
                             dl_batch, complete_vv_batch, 
                             dls_for_complete_vv_batch, s3_manifest_batch >>

Crash == /\ pc["vdr-worker"] = "Crash"
         /\ pc' = [pc EXCEPT !["vdr-worker"] = "RunBatch"]
         /\ UNCHANGED << seqno_sequence, num_requests_started, api_finished, 
                         next_dl_id, next_vault_version_id, db_dls, 
                         db_vault_versions, db_blobs, s3_blobs, s3_manifests, 
                         request, next_seqno, api_finished_at_start_of_batch, 
                         vv_batch, dl_batch, complete_vv_batch, 
                         dls_for_complete_vv_batch, s3_manifest_batch >>

Shutdown == /\ pc["vdr-worker"] = "Shutdown"
            /\ TRUE
            /\ pc' = [pc EXCEPT !["vdr-worker"] = "Done"]
            /\ UNCHANGED << seqno_sequence, num_requests_started, api_finished, 
                            next_dl_id, next_vault_version_id, db_dls, 
                            db_vault_versions, db_blobs, s3_blobs, 
                            s3_manifests, request, next_seqno, 
                            api_finished_at_start_of_batch, vv_batch, dl_batch, 
                            complete_vv_batch, dls_for_complete_vv_batch, 
                            s3_manifest_batch >>

VdrWorker == RunBatch \/ GetVaultVersionBatch \/ GetDlBatch
                \/ WriteBlobsToS3 \/ CommitBlobBatch
                \/ GetCompleteVaultVersionBatch
                \/ GetDlsForCompleteVaultVersionBatch
                \/ WriteVersionedManifestsToS3 \/ WriteLatestManifestsToS3
                \/ CommitManifests \/ LoopOrEnd \/ Crash \/ Shutdown

(* Allow infinite stuttering to prevent deadlock on termination. *)
Terminating == /\ \A self \in ProcSet: pc[self] = "Done"
               /\ UNCHANGED vars

Next == VdrWorker
           \/ (\E self \in Vaults: VaultApiInstance(self))
           \/ Terminating

Spec == /\ Init /\ [][Next]_vars
        /\ \A self \in Vaults : WF_vars(VaultApiInstance(self))
        /\ SF_vars(VdrWorker)

Termination == <>(\A self \in ProcSet: pc[self] = "Done")

\* END TRANSLATION


\* Apply strong fairness constraints on crashes (i.e. forbid crash loops).
VdrDoesntCrashNow == pc' # [pc EXCEPT !["vdr-worker"] = "Crash"]
FairSpec ==
    /\ Spec
    /\ SF_vars(WriteBlobsToS3 /\ VdrDoesntCrashNow)
    /\ SF_vars(CommitBlobBatch /\ VdrDoesntCrashNow)
    /\ SF_vars(WriteVersionedManifestsToS3 /\ VdrDoesntCrashNow)
    /\ SF_vars(WriteLatestManifestsToS3 /\ VdrDoesntCrashNow)
    /\ SF_vars(CommitManifests /\ VdrDoesntCrashNow)

\* Faster to check than FairSpec, but not as complete. Only checks models that terminate.
TerminatesSpec == Spec /\ <>(Termination)

\* Invariants
BatchTypeInvariant ==
    /\ vv_batch \subseteq VaultVersion
    /\ dl_batch \subseteq DataLifetime
    /\ complete_vv_batch \subseteq VaultVersion
    /\ DOMAIN dls_for_complete_vv_batch \subseteq VaultVersion
    /\ Range(dls_for_complete_vv_batch) \subseteq SUBSET DataLifetime
    /\ DOMAIN s3_manifest_batch \subseteq S3ManifestKey
    /\ Range(s3_manifest_batch) \subseteq S3ManifestValue

Terminated == (\A self \in ProcSet: pc[self] = "Done")
VaultApiFinishesGeneration == Terminated => (num_requests_started = MaxNumRequests)
AtTermAllBlobsAreWritten == Terminated => (
    /\ Cardinality(db_blobs) = Cardinality(db_dls)
    /\ db_blobs = s3_blobs
)

AtTermAllVaultVersionsWritten == Terminated => (
    {<<vv.vault, vv.version>> : vv \in db_vault_versions} = {<<key[1], s3_manifests[key].version>> : key \in DOMAIN s3_manifests}
)

AtTermOneVersionedManifestPerVaultVersion == Terminated => (
    Cardinality(db_vault_versions) = Cardinality({key \in DOMAIN s3_manifests : key[2] # LATEST_VERSION})
)

AtTermOneLatestKeyPerVaultWithWrites == Terminated => (
    Cardinality({ vv.vault : vv \in db_vault_versions}) = Cardinality({key \in DOMAIN s3_manifests : key[2] = LATEST_VERSION})
)

LatestS3ManifestNotWrittenWithoutVersionedManifest == (
    \A vault \in Vaults: (
        <<vault, LATEST_VERSION>> \in DOMAIN s3_manifests => (
            \E other \in DOMAIN s3_manifests: (
                (other[1] = vault /\ other[2] # LATEST_VERSION)
            )
        )
    )
)

AtTermLatestS3ManifestVersionIsGreatestVersionForEachVault == Terminated => (
    \A vault \in Vaults: (
        LET latest_key == <<vault, LATEST_VERSION>>
        IN
            latest_key \in DOMAIN s3_manifests => ~\E other \in DOMAIN s3_manifests: (
                /\ other[1] = vault
                /\ s3_manifests[other].version > s3_manifests[latest_key].version
            )
    )
)

S3VersionedManifestVersionsAreNotSkippedBeforeLatestManifestsWritten == (
    \A vault \in Vaults: (
        LET
            latest_key == <<vault, LATEST_VERSION>>
            s3_versioned_manifests_for_vault == {key \in DOMAIN s3_manifests: key[1] = vault /\ key[2] # LATEST_VERSION}
        IN
            latest_key \in DOMAIN s3_manifests => (
                (1..s3_manifests[latest_key].version) \subseteq {s3_manifests[key].version: key \in s3_versioned_manifests_for_vault}
            )
    )
)

\* Properties
DlBatchUpdatesCorrect == [][DOMAIN dls_for_complete_vv_batch' = complete_vv_batch]_dls_for_complete_vv_batch


=============================================================================
