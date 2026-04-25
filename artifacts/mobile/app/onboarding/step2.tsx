import React from "react";

import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";

export default function OnboardingStep2() {
  return (
    <OnboardingScreen
      step={2}
      image={require("../../assets/images/character-2.png")}
      title="Your Travel Companion!"
      subtitle="Pack all of your important stuff and make your trip hassle free!"
      nextHref="/onboarding/step3"
      skipHref="/(auth)/login"
    />
  );
}
