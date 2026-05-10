<script setup lang="ts">
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const { fetch: fetchSession } = useUserSession();

async function handleLogin() {
    loading.value = true;

    try {
        await useFetch('/api/auth/login', {
            method: 'POST',
            body: { email: email.value, password: password.value },
        });
        await fetchSession();
        await navigateTo('/internal/events');
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
    <div
        class="min-h-dvh flex items-center justify-center bg-gradient-to-r from-primary/10 via-background/95 to-primary/10 px-4">
        <form class="w-full max-w-sm space-y-6 rounded-2xl bg-white/80 backdrop-blur p-8 shadow-lg"
            @submit.prevent="handleLogin">
            <h1 class="text-2xl font-bold text-center text-primary-900">
                Hallöchen Login
            </h1>

            <div v-if="error" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {{ error }}
            </div>

            <div class="space-y-1">
                <label for="email" class="block text-sm font-medium text-gray-700">
                    E-Mail
                </label>
                <input id="email" v-model="email" type="email" required autocomplete="email"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
            </div>

            <div class="space-y-1">
                <label for="password" class="block text-sm font-medium text-gray-700">
                    Passwort
                </label>
                <input id="password" v-model="password" type="password" required autocomplete="current-password"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
            </div>

            <button type="submit" :disabled="loading"
                class="w-full rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50 transition-colors cursor-pointer">
                {{ loading ? 'Anmelden…' : 'Anmelden' }}
            </button>
        </form>
    </div>
</template>