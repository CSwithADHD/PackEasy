import React from "react";

import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";

export default function OnboardingStep3() {
  return (
    <OnboardingScreen
      step={3}
      image={require("../../assets/images/character-3.png")}
      title="Start Your Journey Now!"
      ctaLabel="Let's Explore"
      nextHref="/(auth)/login"
    />
  );
}
