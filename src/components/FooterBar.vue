<script setup lang="ts">
import instagramIcon from '@/assets/instagram.svg?raw';
import letterIcon from '@/assets/letter.svg?raw';
import logoSmall from '@/assets/logo-small.svg?raw';
import BottonBarLink from './BottonBarLink.vue';
</script>

<template>
    <div class="h-52 bg-gray-900 text-on-primary">
        <div class="max-w-7xl mx-auto px-4 h-full flex items-start justify-between p-4">
            <div class="h-full max-w-[50dvw]">
                <p class="text-sm pt-2 pb-6">
                    &copy; 2026 Moabiter Trinkgenossenschaft eG
                </p>
                <span class="block text-accent max-w-[50dvw] w-8 md:w-12 [&>svg]:h-auto [&>svg]:w-full"
                    aria-hidden="true" v-html="logoSmall" />
            </div>
            <div class="h-full flex flex-col items-start justify-start space-y-1 md:flex-row md:space-y-0 md:space-x-2">
                <div class="flex space-x-2">
                    <BottonBarLink :is="'a'" href="https://www.instagram.com/halloechen_moabit/" target="_blank"
                        rel="noopener noreferrer" aria-label="Instagram">
                        <span class="size-6 [&>svg]:size-full" aria-hidden="true" v-html="instagramIcon" />
                    </BottonBarLink>
                    <BottonBarLink :is="'a'" href="mailto:info@halloechen.org"
                        aria-label="E-Mail an info@halloechen.org">
                        <span class="size-6 [&>svg]:size-full" aria-hidden="true" v-html="letterIcon" />
                    </BottonBarLink>
                </div>
                <BottonBarLink :is="'router-link'" to="/legal">
                    <span>Impressum</span>
                </BottonBarLink>
                <BottonBarLink :is="'router-link'" to="/privacy">
                    <span>Datenschutz</span>
                </BottonBarLink>
            </div>
        </div>
    </div>
</template>
