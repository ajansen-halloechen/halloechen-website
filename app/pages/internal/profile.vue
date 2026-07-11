<script setup lang="ts">
import { UserCircleIcon } from '@heroicons/vue/24/outline';
import {
  PASSWORD_REQUIREMENTS_HINT,
  passwordValidationMessage,
  validatePassword,
} from '~~/shared/password';
import {
  normalizePhoneNumber,
  phoneValidationMessage,
  validatePhoneNumber,
} from '~~/shared/phone';
import type { User } from '~~/shared/types/user';

definePageMeta({ layout: 'internal', middleware: ['auth'] });

type ProfileSnapshot = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

const { success, error: toastError } = useToast();
const { fetch: fetchSession } = useUserSession();

const { data: profile, refresh: refreshProfile } =
  await useFetch<User>('/api/me');

const avatar = computed(() => profile.value?.avatar ?? null);

const avatarLoading = ref(false);
const showAvatarDeleteModal = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const phoneNumber = ref('');
const oldPassword = ref('');
const password = ref('');

const error = ref('');
const passwordError = ref('');
const phoneError = ref('');
const loading = ref(false);

const snapshot = ref<ProfileSnapshot | null>(null);

function applySnapshot(data: ProfileSnapshot) {
  firstName.value = data.firstName;
  lastName.value = data.lastName;
  email.value = data.email;
  phoneNumber.value = data.phoneNumber;
  snapshot.value = { ...data };
}

watch(
  profile,
  (user) => {
    if (!user) return;
    applySnapshot({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email,
      phoneNumber: user.phoneNumber ?? '',
    });
  },
  { immediate: true },
);

const isDirty = computed(() => {
  if (!snapshot.value) return false;

  const profileChanged =
    firstName.value !== snapshot.value.firstName ||
    lastName.value !== snapshot.value.lastName ||
    email.value !== snapshot.value.email ||
    phoneNumber.value !== snapshot.value.phoneNumber;

  const passwordChanged = oldPassword.value !== '' || password.value !== '';

  return profileChanged || passwordChanged;
});

function clearErrors() {
  error.value = '';
  passwordError.value = '';
  phoneError.value = '';
}

function triggerAvatarUpload() {
  fileInputRef.value?.click();
}

async function handleAvatarSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';

  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toastError('Bitte wähle eine Bilddatei aus.');
    return;
  }

  if (file.size > MAX_AVATAR_SIZE) {
    toastError('Die Datei ist zu groß (max. 5 MB).');
    return;
  }

  avatarLoading.value = true;

  try {
    const formData = new FormData();
    formData.append('file', file);
    await $fetch('/api/avatar', {
      method: 'POST',
      body: formData,
    });
    await fetchSession();
    await refreshProfile();
    success('Avatar aktualisiert.');
  } catch {
    toastError('Avatar konnte nicht hochgeladen werden.');
  } finally {
    avatarLoading.value = false;
  }
}

async function handleAvatarRemove() {
  avatarLoading.value = true;

  try {
    await $fetch('/api/avatar', { method: 'DELETE' });
    await fetchSession();
    await refreshProfile();
    showAvatarDeleteModal.value = false;
    success('Avatar entfernt.');
  } catch {
    toastError('Avatar konnte nicht entfernt werden.');
  } finally {
    avatarLoading.value = false;
  }
}

function clearPasswordFields() {
  oldPassword.value = '';
  password.value = '';
}

function handleReset() {
  if (!snapshot.value) return;
  applySnapshot(snapshot.value);
  clearPasswordFields();
  clearErrors();
}

async function handleSave() {
  clearErrors();

  if (!snapshot.value) return;

  const body: Record<string, string> = {};

  if (firstName.value !== snapshot.value.firstName) {
    body.firstName = firstName.value;
  }
  if (lastName.value !== snapshot.value.lastName) {
    body.lastName = lastName.value;
  }
  if (email.value !== snapshot.value.email) {
    body.email = email.value;
  }
  if (phoneNumber.value !== snapshot.value.phoneNumber) {
    const phoneValidationErr = validatePhoneNumber(phoneNumber.value);
    if (phoneValidationErr) {
      phoneError.value = phoneValidationMessage(phoneValidationErr);
      return;
    }
    body.phoneNumber = normalizePhoneNumber(phoneNumber.value);
  }

  if (oldPassword.value || password.value) {
    if (!password.value) {
      passwordError.value = 'Bitte gib ein neues Passwort ein.';
      return;
    }
    if (!oldPassword.value) {
      passwordError.value = 'Bitte gib dein aktuelles Passwort ein.';
      return;
    }
    const passwordValidationErr = validatePassword(password.value);
    if (passwordValidationErr) {
      passwordError.value = passwordValidationMessage(passwordValidationErr);
      return;
    }
    body.oldPassword = oldPassword.value;
    body.password = password.value;
  }

  loading.value = true;

  try {
    await $fetch('/api/me', {
      method: 'PATCH',
      body,
    });
    await fetchSession();
    await refreshProfile();
    if (profile.value) {
      applySnapshot({
        firstName: profile.value.firstName ?? '',
        lastName: profile.value.lastName ?? '',
        email: profile.value.email,
        phoneNumber: profile.value.phoneNumber ?? '',
      });
    }
    clearPasswordFields();
    success('Profil gespeichert.');
  } catch (e: unknown) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'statusCode' in e &&
      (e as { statusCode: unknown }).statusCode === 401
    ) {
      passwordError.value = 'Das aktuelle Passwort ist falsch.';
    } else if (
      typeof e === 'object' &&
      e !== null &&
      'statusCode' in e &&
      (e as { statusCode: unknown }).statusCode === 409
    ) {
      error.value = 'Diese E-Mail-Adresse ist bereits registriert.';
    } else if (
      typeof e === 'object' &&
      e !== null &&
      'statusCode' in e &&
      (e as { statusCode: unknown }).statusCode === 400 &&
      (oldPassword.value || password.value)
    ) {
      passwordError.value =
        'Die Passwortänderung konnte nicht gespeichert werden. Bitte prüfe deine Eingaben.';
    } else {
      toastError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UiPage heading="Profil" size="xl">
    <div class="max-w-5xl mx-auto w-full flex flex-col gap-6">
      <div class="flex flex-col items-center gap-4 py-2">
        <div
          class="h-56 w-56 lg:h-72 lg:w-72 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center"
        >
          <img
            v-if="avatar"
            :src="avatar"
            alt="Profilbild"
            class="h-full w-full object-cover"
          />
          <UserCircleIcon
            v-else
            class="h-44 w-44 lg:h-60 lg:w-60 text-on-surface/50"
          />
        </div>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleAvatarSelect"
        />
        <div class="flex flex-wrap items-center justify-center gap-2">
          <UiButton
            v-if="avatar"
            type="button"
            color="error"
            :disabled="avatarLoading"
            @click="showAvatarDeleteModal = true"
          >
            Bild entfernen
          </UiButton>
          <UiButton
            type="button"
            :disabled="avatarLoading"
            @click="triggerAvatarUpload"
          >
            {{ avatarLoading ? 'Bild ändern…' : 'Bild ändern' }}
          </UiButton>
        </div>
      </div>

      <div class="bg-surface p-4 border border-accent border-3 rounded-md">
        <form
          class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
          @submit.prevent="handleSave"
        >
          <div
            v-if="error"
            class="lg:col-span-2 px-4 py-2 bg-error text-sm text-on-error rounded-md"
          >
            {{ error }}
          </div>
          <div class="lg:col-span-2 flex flex-col gap-4 pt-2">
            <h2 class="text-lg font-semibold">Kontakt</h2>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <UiInputField
                id="first-name"
                v-model="firstName"
                label="Vorname"
                required
                autocomplete="given-name"
              />
              <UiInputField
                id="last-name"
                v-model="lastName"
                label="Nachname"
                required
                autocomplete="family-name"
              />
              <UiInputField
                id="email"
                v-model="email"
                label="E-Mail"
                type="email"
                required
                autocomplete="email"
              />
              <div class="flex flex-col gap-1">
                <UiInputField
                  id="phone-number"
                  v-model="phoneNumber"
                  label="Telefonnummer"
                  type="tel"
                  required
                  autocomplete="tel"
                />
                <p v-if="phoneError" class="text-sm text-red-600">
                  {{ phoneError }}
                </p>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2 flex flex-col gap-4 pt-2">
            <h2 class="text-lg font-semibold">Passwort ändern</h2>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <UiInputField
                id="old-password"
                v-model="oldPassword"
                label="Aktuelles Passwort"
                type="password"
                autocomplete="current-password"
              />
              <div class="flex flex-col gap-1">
                <UiInputField
                  id="new-password"
                  v-model="password"
                  label="Neues Passwort"
                  type="password"
                  autocomplete="new-password"
                />
                <p class="text-sm text-on-surface/70">
                  {{ PASSWORD_REQUIREMENTS_HINT }}
                </p>
                <p v-if="passwordError" class="text-sm text-red-600">
                  {{ passwordError }}
                </p>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2 w-full flex justify-end gap-2">
            <UiButton
              type="button"
              variant="outlined"
              :disabled="!isDirty || loading"
              @click="handleReset"
            >
              Zurücksetzen
            </UiButton>
            <UiButton type="submit" :disabled="!isDirty || loading">
              {{ loading ? 'Speichern…' : 'Speichern' }}
            </UiButton>
          </div>
        </form>
      </div>
    </div>

    <UiConfirmDeleteModal
      v-model:open="showAvatarDeleteModal"
      title="Profilbild entfernen"
      description="Möchtest du dein Profilbild wirklich entfernen?"
      :loading="avatarLoading"
      @confirm="handleAvatarRemove"
    />
  </UiPage>
</template>
