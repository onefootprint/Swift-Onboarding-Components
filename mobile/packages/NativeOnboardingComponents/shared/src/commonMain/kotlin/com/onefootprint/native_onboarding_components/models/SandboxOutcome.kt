package com.onefootprint.native_onboarding_components.models

import co.touchlab.skie.configuration.annotations.DefaultArgumentInterop
import org.openapitools.client.models.DocumentFixtureResult
import org.openapitools.client.models.WorkflowFixtureResult

typealias OverallOutcome = WorkflowFixtureResult
typealias DocumentOutcome = DocumentFixtureResult

class SandboxOutcome(val id: String? = null, val overallOutcome: OverallOutcome, val documentOutcome: DocumentOutcome? = null)