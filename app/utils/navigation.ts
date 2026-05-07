type Section = {
  id: string;
  title: string;
};

const sections = {
  HERO: { id: "hero", title: "Info" },
  EVENTS: { id: "events", title: "Veranstaltungen" },
  CONCEPT: { id: "concept", title: "Konzept" },
  LOCATION_AND_BUSINESS_HOURS: {
    id: "location-and-business-hours",
    title: "Raum und Zeit",
  },
} as const satisfies Record<string, Section>;

const sectionIds = Object.values(sections).map((section) => section.id);

export { sections, sectionIds };
