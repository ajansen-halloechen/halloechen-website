<script setup lang="ts">
import { ref } from 'vue';

const mapLoaded = ref(false);

const onMapLoad = () => {
  setTimeout(() => {
    mapLoaded.value = true;
  }, 500);
};
</script>

<template>
  <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
    <div class="space-y-6">
      <h3 class="text-xl font-semibold">Raum:</h3>
      <div class="w-full max-w-xl aspect-[4/3] relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2427.183252228707!2d13.328274877647784!3d52.53011853547905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a851af3f3a5f61%3A0x9703c9045c49ca3a!2sHall%C3%B6chen!5e0!3m2!1sde!2sde!4v1768928723404!5m2!1sde!2sde"
          class="w-full h-full" style="border: 0" allowfullscreen loading="lazy"
          referrerpolicy="no-referrer-when-downgrade" @load="onMapLoad" />
        <div v-if="!mapLoaded"
          class="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-900/60">
          <div class="h-10 w-10 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
    <div class="space-y-6">
      <h3 class="text-xl font-semibold">Zeit:</h3>
      <!-- Banner: Zurzeit wegen Umbau nur zu Veranstaltungen geöffnet -->
      <div class="px-4 py-2 bg-secondary text-on-secondary font-semibold rounded-md flex justify-center items-center">
        Momentan wegen Umbau nur zu Veranstaltungen geöffnet!
      </div>
      <table class="border-collapse max-w-xs gap-1">
        <tbody>
          <tr>
            <td class="pr-2 align-top whitespace-nowrap">Donnerstag:</td>
            <td class="tabular-nums align-top whitespace-nowrap">
              18:00&nbsp;bis&nbsp;01:00&nbsp;Uhr
            </td>
          </tr>
          <tr>
            <td class="pr-2 align-top whitespace-nowrap">Freitag:</td>
            <td class="tabular-nums align-top whitespace-nowrap">
              18:00&nbsp;bis&nbsp;Schluss
            </td>
          </tr>
          <tr>
            <td class="pr-2 align-top whitespace-nowrap">Samstag:</td>
            <td class="tabular-nums align-top whitespace-nowrap">
              18:00&nbsp;bis&nbsp;Schluss
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
