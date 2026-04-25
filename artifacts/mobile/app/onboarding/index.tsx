import React from "react";

import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";

export default function OnboardingStep1() {
  return (
    <OnboardingScreen
      step={1}
      image={require("../../assets/images/character-1.png")}
      title="Travel light, Pack Easy!"
      nextHref="/onboarding/step2"
      skipHref="/(auth)/login"
    />
  );
}
