<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

defineProps<{
    src: string;
}>();

const mapEnabled = ref(false);
const mapLoaded = ref(false);

const enableMap = () => {
    mapEnabled.value = true;
};

const onMapLoad = () => {
    setTimeout(() => {
        mapLoaded.value = true;
    }, 500);
};
</script>

<template>
    <div class="w-full h-full relative overflow-hidden rounded-md">
        <div v-if="!mapEnabled"
            class="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center border border-accent border-3 rounded-md">
            <p class="text-sm">
                Mit dem Klick auf den Button wird Google Maps geladen. Dabei können personenbezogene Daten (z. B.
                Ihre IP-Adresse) an Google übermittelt werden.
            </p>
            <button class="px-4 py-2 rounded-md bg-primary text-on-primary font-semibold hover:opacity-90 transition"
                type="button" @click="enableMap">
                Karte laden
            </button>
            <p class="text-xs">
                Details in der
                <RouterLink to="/privacy" class="underline text-primary">Datenschutzerklärung</RouterLink>.
            </p>
        </div>

        <iframe v-else :src="src" class="w-full h-full" style="border: 0" allowfullscreen loading="lazy"
            referrerpolicy="no-referrer-when-downgrade" @load="onMapLoad" />

        <div v-if="mapEnabled && !mapLoaded"
            class="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-900/60">
            <div class="h-10 w-10 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin"></div>
        </div>
    </div>
</template>
