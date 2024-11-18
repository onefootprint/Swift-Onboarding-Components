package com.onefootprint.native_onboarding_components.models

enum class OverallOutcome{
    PASS {
        override fun toString(): String {
            return "pass"
        }
    },
    FAIL {
        override fun toString(): String {
            return "fail"
        }
    },
    MANUAL_REVIEW {
        override fun toString(): String {
            return "manual_review"
        }
    },
    USE_RULES_OUTCOME {
        override fun toString(): String {
            return "use_rules_outcome"
        }
    },
    STEP_UP {
        override fun toString(): String {
            return "step_up"
        }
    }
}

enum class DocumentOutcome {
    PASS {
        override fun toString(): String {
            return "pass"
        }
    },
    FAIL {
        override fun toString(): String {
            return "fail"
        }
    },
    REAL {
        override fun toString(): String {
            return "real"
        }
    }
}

class SandboxOutcome(val overallOutcome: OverallOutcome, val documentOutcome: DocumentOutcome?)