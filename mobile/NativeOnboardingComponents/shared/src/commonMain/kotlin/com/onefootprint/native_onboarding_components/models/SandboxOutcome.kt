package com.onefootprint.native_onboarding_components.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class OverallOutcome{
    @SerialName("pass") PASS {
        override fun toString(): String {
            return "pass"
        }
    },
    @SerialName("fail") FAIL {
        override fun toString(): String {
            return "fail"
        }
    },
    @SerialName("manual_review") MANUAL_REVIEW {
        override fun toString(): String {
            return "manual_review"
        }
    },
    @SerialName("use_rules_outcome") USE_RULES_OUTCOME {
        override fun toString(): String {
            return "use_rules_outcome"
        }
    },
    @SerialName("step_up") STEP_UP {
        override fun toString(): String {
            return "step_up"
        }
    }
}

@Serializable
enum class DocumentOutcome {
    @SerialName("pass") PASS {
        override fun toString(): String {
            return "pass"
        }
    },
    @SerialName("fail") FAIL {
        override fun toString(): String {
            return "fail"
        }
    },
    @SerialName("real") REAL {
        override fun toString(): String {
            return "real"
        }
    }
}

class SandboxOutcome(val overallOutcome: OverallOutcome, val documentOutcome: DocumentOutcome? = null)