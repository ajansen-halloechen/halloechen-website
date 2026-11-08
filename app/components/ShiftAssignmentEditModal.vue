<script setup lang="ts">
import type { ResolvedShiftAvailability } from '~~/shared/types/shift-availability';
import type { User } from '~~/shared/types/user';
import type { SelectOption } from '~/components/ui/Select.vue';
import { getUserDisplayName } from '~/utils/user-display';

const props = defineProps<{
  plannedShiftId: string;
  month: string;
  initialUserIds: string[];
  numberOfPersons: number;
  users: User[];
  titleContext: string;
}>();

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  success: [];
}>();

const { success, error: toastError } = useToast();

const slotUserIds = ref<(string | null)[]>([]);
const showUnavailable = ref(false);
const loading = ref(false);
const loadingAvailabilities = ref(false);
const availabilities = ref<ResolvedShiftAvailability[]>([]);

const sortedUsers = computed(() =>
  [...props.users].sort((a, b) =>
    getUserDisplayName(a).localeCompare(getUserDisplayName(b), 'de'),
  ),
);

const availableUserIds = computed(() => {
  const ids = new Set<string>();
  for (const availability of availabilities.value) {
    if (availability.plannedShiftId !== props.plannedShiftId) continue;
    if (availability.status === 'unavailable') continue;
    ids.add(availability.userId);
  }
  return ids;
});

const optionsPerSlot = computed(() =>
  slotUserIds.value.map((currentValue, slotIndex) => {
    const selectedElsewhere = new Set(
      slotUserIds.value.filter(
        (userId, index): userId is string =>
          index !== slotIndex && Boolean(userId),
      ),
    );

    return sortedUsers.value
      .filter((user) => {
        if (selectedElsewhere.has(user.id)) return false;
        if (showUnavailable.value) return true;
        if (currentValue === user.id) return true;
        return availableUserIds.value.has(user.id);
      })
      .map(
        (user): SelectOption => ({
          value: user.id,
          label: getUserDisplayName(user),
        }),
      );
  }),
);

function getSlotUserId(slotIndex: number): string | null {
  return slotUserIds.value[slotIndex] ?? null;
}

function setSlotUserId(slotIndex: number, userId: string | null) {
  slotUserIds.value[slotIndex] = userId;
}

function fetchErrorMessage(err: unknown, fallback: string) {
  if (
    err &&
    typeof err === 'object' &&
    'data' in err &&
    err.data &&
    typeof err.data === 'object' &&
    'statusMessage' in err.data &&
    typeof err.data.statusMessage === 'string'
  ) {
    return err.data.statusMessage;
  }
  return fallback;
}

async function loadAvailabilities() {
  loadingAvailabilities.value = true;
  try {
    availabilities.value = await $fetch<ResolvedShiftAvailability[]>(
      '/api/shift-availabilities',
      {
        query: { month: props.month, allUsers: 'true' },
      },
    );
  } catch (err: unknown) {
    toastError(
      fetchErrorMessage(err, 'Verfügbarkeiten konnten nicht geladen werden.'),
    );
    showUnavailable.value = true;
  } finally {
    loadingAvailabilities.value = false;
  }
}

watch(
  open,
  async (isOpen) => {
    if (!isOpen) return;

    showUnavailable.value = false;
    slotUserIds.value = Array.from(
      { length: props.numberOfPersons },
      (_, index) => props.initialUserIds[index] ?? null,
    );
    await loadAvailabilities();
  },
  { immediate: true },
);

async function handleSubmit() {
  const userIds = slotUserIds.value.filter((userId): userId is string =>
    Boolean(userId),
  );

  loading.value = true;
  try {
    await $fetch(
      `/api/shift-assignments/by-planned-shift/${props.plannedShiftId}`,
      {
        method: 'PUT',
        body: { userIds },
      },
    );
    open.value = false;
    success('Zuweisung wurde gespeichert.');
    emit('success');
  } catch (err: unknown) {
    toastError(
      fetchErrorMessage(
        err,
        'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
      ),
    );
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UiModal v-model:open="open" title="Zuweisung bearbeiten">
    <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <p class="text-gray-600">{{ titleContext }}</p>

      <div class="flex flex-col gap-3">
        <UiSearchSelect
          v-for="(_, index) in slotUserIds"
          :id="`assign-slot-${index}`"
          :key="index"
          :model-value="getSlotUserId(index)"
          :label="`Genoss*in ${index + 1}`"
          :options="optionsPerSlot[index] ?? []"
          placeholder="Genoss*in suchen…"
          empty-text="Keine Genoss*innen gefunden"
          @update:model-value="setSlotUserId(index, $event)"
        />
      </div>

      <UiCheckbox
        id="assign-show-unavailable"
        v-model="showUnavailable"
        label="Auch nicht verfügbare Genoss*innen anzeigen"
      />

      <div class="flex justify-end gap-2">
        <UiButton
          type="button"
          variant="outlined"
          :disabled="loading"
          @click="open = false"
        >
          Abbrechen
        </UiButton>
        <UiButton type="submit" :disabled="loading || loadingAvailabilities">
          {{ loading ? 'Speichern…' : 'Speichern' }}
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>
