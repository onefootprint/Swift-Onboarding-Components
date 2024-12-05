package org.openapitools.client.models

import kotlinx.serialization.DeserializationStrategy
import kotlinx.serialization.Polymorphic
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.JsonContentPolymorphicSerializer
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

object OnboardingRequirementSerializer : JsonContentPolymorphicSerializer<OnboardingRequirement>(OnboardingRequirement::class) {
    override fun selectDeserializer(element: JsonElement): DeserializationStrategy<out OnboardingRequirement> {
        val kind = element.jsonObject["kind"]?.jsonPrimitive?.content
            ?: throw SerializationException("Missing 'kind' property for OnboardingRequirement")

        return when (kind) {
            "register_auth_method" -> OnboardingRequirementRegisterAuthMethod.serializer()
            "collect_investor_profile" -> OnboardingRequirementCollectInvestorProfile.serializer()
            "create_business_onboarding" -> OnboardingRequirementCreateBusinessOnboarding.serializer()
            "collect_business_data" -> OnboardingRequirementCollectBusinessData.serializer()
            "collect_document" -> OnboardingRequirementCollectDocument.serializer()
            "authorize" -> OnboardingRequirementAuthorize.serializer()
            "collect_data" -> OnboardingRequirementCollectData.serializer()
            "process" -> OnboardingRequirementProcess.serializer()
            "liveness" -> OnboardingRequirementRegisterPasskey.serializer()
            else -> OnboardingRequirementUnknown.serializer()
        }
    }
}


@Polymorphic
@Serializable(with = OnboardingRequirementSerializer::class)
sealed class OnboardingRequirement

@Serializable
data class OnboardingRequirementUnknown(
    val kind: String
) : OnboardingRequirement()