<script setup lang="ts">
import { TimeFieldRoot, TimeFieldInput } from 'reka-ui';
import { Time } from '@internationalized/date';

defineProps<{
  id: string;
  label: string;
  required?: boolean;
}>();

const model = defineModel<string>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Time #private field breaks Volar structural typing
const pickerValue = ref<any>(parseTime(model.value));

function parseTime(val: string | undefined): Time | undefined {
  if (!val) return undefined;
  const [h, m, s = 0] = val.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m) || Number.isNaN(s)) return undefined;
  return new Time(h, m, s);
}

function formatTime(time: Time): string {
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
}

watch(model, (v) => {
  const parsed = parseTime(v);
  if (parsed?.toString() !== pickerValue.value?.toString()) {
    pickerValue.value = parsed;
  }
});

watch(pickerValue, (v) => {
  if (!v) {
    if (model.value) model.value = '';
    return;
  }
  const formatted = formatTime(v);
  if (formatted !== model.value) {
    model.value = formatted;
  }
});
</script>

<template>
  <UiInputField :id="id" :label="label" :required="required">
    <TimeFieldRoot
      :id="id"
      v-model="pickerValue"
      locale="de-DE"
      :hour-cycle="24"
      granularity="minute"
      :required="required"
    >
      <template #default="{ segments }">
        <div class="flex min-w-0 w-full items-center">
          <template v-for="item in segments" :key="item.part">
            <TimeFieldInput v-if="item.part === 'literal'" :part="item.part">
              <span class="text-gray-400">{{ item.value }}</span>
            </TimeFieldInput>
            <TimeFieldInput
              v-else
              :part="item.part"
              class="rounded px-1 text-center tabular-nums outline-none data-[placeholder]:text-gray-400 focus:bg-primary/10"
            >
              {{ item.value }}
            </TimeFieldInput>
          </template>
        </div>
      </template>
    </TimeFieldRoot>
  </UiInputField>
</template>
