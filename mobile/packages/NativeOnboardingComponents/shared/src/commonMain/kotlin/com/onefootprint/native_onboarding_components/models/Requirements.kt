package com.onefootprint.native_onboarding_components.models

import org.openapitools.client.models.DataIdentifier

class RequirementsState(val isCompleted: Boolean, val isMissing: Boolean)
class RequirementFields(val optional: List<DataIdentifier>, val collected: List<DataIdentifier>, val missing: List<DataIdentifier>)

class Requirements(val requirements: RequirementsState, val fields: RequirementFields, val canUpdateUserData: Boolean, val canProcessInline: Boolean)