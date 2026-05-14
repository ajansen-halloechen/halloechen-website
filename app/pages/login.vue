<script setup lang="ts">
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const { fetch: fetchSession } = useUserSession();

async function handleLogin() {
    error.value = '';
    loading.value = true;

    try {
        await $fetch('/api/auth/login', {
            method: 'POST',
            body: { email: email.value, password: password.value },
        });
        await fetchSession();
        await navigateTo('/internal/working-hours');
    } catch (e: unknown) {
        if (e instanceof Error && 'statusCode' in e && (e as any).statusCode === 401) {
            error.value = 'Ungültige E-Mail oder Passwort.';
        } else {
            error.value = 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
        }
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="w-full grow flex items-center justify-center">
        <form
            class="w-full min-h-90 max-w-sm flex flex-col gap-4 bg-neutral-50 p-8 mx-2 border border-accent border-3 rounded-md"
            @submit.prevent="handleLogin">
            <h1 class="text-2xl font-bold text-center">
                Für internen Bereich anmelden
            </h1>
            <div v-if="error" class="px-4 py-2 bg-secondary text-sm text-on-secondary rounded-md">
                {{ error }}
            </div>
            <UiInputField id="email" v-model="email" label="E-Mail" type="email" required autocomplete="email" />
            <UiInputField id="password" v-model="password" label="Passwort" type="password" required
                autocomplete="current-password" />

            <UiButton type="submit" :disabled="loading" class="w-full">
                {{ loading ? 'Anmelden…' : 'Anmelden' }}
            </UiButton>
        </form>
    </div>
</template>