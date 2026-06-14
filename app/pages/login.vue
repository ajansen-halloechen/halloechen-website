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
        if (
            typeof e === 'object'
            && e !== null
            && 'statusCode' in e
            && (e as { statusCode: unknown }).statusCode === 401
        ) {
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
    <UiAuthPanel>
        <template #heading>Für internen Bereich anmelden</template>
        <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
            <div v-if="error" class="px-4 py-2 bg-secondary text-sm text-on-secondary rounded-md">
                {{ error }}
            </div>
            <UiInputField id="email" v-model="email" label="E-Mail" type="email" required autocomplete="email" />
            <UiInputField
id="password" v-model="password" label="Passwort" type="password" required
                autocomplete="current-password" />

            <UiButton type="submit" :disabled="loading" class="w-full">
                {{ loading ? 'Anmelden…' : 'Anmelden' }}
            </UiButton>
        </form>
    </UiAuthPanel>
</template>