# Vault Disaster Recovery Formal Modeling

## What is Vault Disaster Recovery?

Vault Disaster Recovery (VDR) is an enterprise feature that provides organizations with increased control over their data vaulted with Footprint in the case of an emergency while maintaining high security and low risk.

With Vault Disaster Recovery enabled, Footprint continuously backs up vaulted data to customer-owned cloud storage (like Amazon S3) in an encrypted format. During normal operation, the organization maintains low risk, as access to the vaulted data is protected and audited by the Footprint platform. However, in a catastrophic situation, if the customer wishes to “break glass” and gain access to their data without using Footprint services, Footprint or an escrow will securely disclose a payload that can be used to decrypt the cloud storage backups.

See more information [here](https://onefootprint.notion.site/Preview-Vault-Disaster-Recovery-Docs-984ca46774a943acbaad622fb9148799).

## Why did VDR need formally verification?
The correctness goal of VDR is for the data in S3 for any given vault (as read by the [`footprint-dr`](https://github.com/onefootprint/monorepo/tree/master/backend/external_tools/footprint-dr) client) to exactly match the state of that vault as reported by the API at some point in the past. Data lag is expected, but the system should converge to a fully consistent state, where S3 backups and the API represent identical data. We do not care about cross-vault temporal consistency, only consistency within a vault.

This is challenging to achieve since S3 has no multi-blob transactional semantics, and the Postgres data model based on Data Lifetimes and sequence numbers has a lot of nuance in terms of event ordering.

The TLA+ models here are a tool to assist us in rapidly validating aspects of VDRs design on scaled down, but exhaustively enumerated test cases. TLA+ applies rigor to the typical "what if" mental exercise of finding concurrency bugs in code to give us greater confidence in the design.

The modeling process uncovered safety issues outside VDR which have been resolved, and ~5+ correctness bugs in initial iterations of VDR.

We've used the PlusCal language for most of the implementation to make the specification read more like traditional code. A good intro to TLA+ & PlusCal is https://learntla.com/. Since we're modeling an interruptable system, but we don't necessarily care about indefinite stalling (e.g. the VDR worker crashes and never comes back online), TLA+ "fairness" is important to consider. The Learn TLA+ site covers this topic, but the best explanation of fairness in practice is this message board comment: https://groups.google.com/g/tlaplus/c/99lWDQyk-wE/m/VM93m1_ZAgAJ.
