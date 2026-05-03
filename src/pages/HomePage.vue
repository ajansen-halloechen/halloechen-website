<script setup lang="ts">
import { sections, sectionIds } from '@/navigation';
import { useTemplateRef } from 'vue';
import CalendarPanel from '@/components/CalendarPanel.vue';
import HeroPanel from '@/components/HeroPanel.vue';
import ConceptPanel from '@/components/ConceptPanel.vue';
import PanelRoot from '@/components/PanelRoot.vue';
import { useScrollSpy } from '@/composables/use-scroll-spy';
import LocationAndBusinessHoursPanel from '@/components/LocationAndBusinessHoursPanel.vue';

// Create a template ref for each section ID
const sectionRefs = sectionIds.map((sectionId) =>
  useTemplateRef<HTMLElement>(sectionId),
);
useScrollSpy(sectionRefs);
</script>

<template>
  <PanelRoot class="max-w-7xl" :ref="sections.HERO.id" :id="sections.HERO.id">
    <HeroPanel />
  </PanelRoot>
  <PanelRoot
    :ref="sections.EVENTS.id"
    :id="sections.EVENTS.id"
    :title="'Veranstaltungen'"
  >
    <CalendarPanel />
  </PanelRoot>
  <PanelRoot
    :ref="sections.CONCEPT.id"
    :id="sections.CONCEPT.id"
    :title="'Konzept'"
  >
    <ConceptPanel />
  </PanelRoot>
  <PanelRoot
    :ref="sections.LOCATION_AND_BUSINESS_HOURS.id"
    :id="sections.LOCATION_AND_BUSINESS_HOURS.id"
    class="mb-10"
    :title="'Raum und Zeit'"
  >
    <LocationAndBusinessHoursPanel />
  </PanelRoot>
</template>
