<script setup lang="ts">
import { sections, sectionIds } from '~/utils/navigation';

// Create a template ref for each section ID
const sectionRefs = sectionIds.map((sectionId) =>
    useTemplateRef<HTMLElement>(sectionId),
);
useScrollSpy(sectionRefs);
</script>

<template>
    <div>
        <PanelRoot :id="sections.HERO.id" :ref="sections.HERO.id" class="max-w-[100rem]">
            <HeroPanel />
        </PanelRoot>
        <PanelRoot :id="sections.EVENTS.id" :ref="sections.EVENTS.id" :title="'Veranstaltungen'">
            <CalendarPanel />
        </PanelRoot>
        <PanelRoot :id="sections.CONCEPT.id" :ref="sections.CONCEPT.id" :title="'Konzept'">
            <ConceptPanel />
        </PanelRoot>
        <PanelRoot :id="sections.LOCATION_AND_BUSINESS_HOURS.id" :ref="sections.LOCATION_AND_BUSINESS_HOURS.id"
            class="mb-10" :title="'Raum und Zeit'">
            <LocationAndBusinessHoursPanel />
        </PanelRoot>
    </div>
</template>
