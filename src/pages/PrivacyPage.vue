<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <h1 class="text-2xl font-bold mb-4 pt-8">Datenschutzerklärung</h1>
  <section class="mb-8">
    <h2 class="text-xl font-bold mb-2">1. Datenschutz auf einen Blick</h2>
    <p>
      Allgemeine Hinweise zum Datenschutz finden Sie in unserer
      <RouterLink to="/legal" class="text-blue-600 underline"
        >Rechtliches</RouterLink
      >.
    </p>
  </section>
  <section class="mb-8">
    <h2 class="text-xl font-bold mb-2">
      2. Allgemeine Hinweise und Pflichtinformationen
    </h2>
    <p>
      Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst.
      Personenbezogene Daten werden von uns nur im notwendigen Umfang erhoben.
      In keinem Fall werden die erhobenen Daten verkauft oder aus anderen
      Gründen an Dritte weitergegeben.
    </p>
  </section>
  <section class="mb-8">
    <h2 class="text-xl font-bold mb-2">
      3. Datenerfassung auf unserer Website
    </h2>
    <p>
      Die Datenverarbeitung auf dieser Website erfolgt durch den
      Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum entnehmen.
    </p>
  </section>
</template>
