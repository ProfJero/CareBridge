export const TUTORIAL_TOPICS = ["Getting started", "Shopping", "Selling", "Home care", "Admin"] as const;
export type TutorialTopic = (typeof TUTORIAL_TOPICS)[number];
export const LANGUAGE_LABEL = { en: "English", tw: "Twi" } as const;
