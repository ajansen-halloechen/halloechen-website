<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from 'reka-ui';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline';
import type { SelectOption } from '~/components/ui/Select.vue';

const model = defineModel<string | null>({ required: true });

const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    options: SelectOption[];
    required?: boolean;
    placeholder?: string;
    emptyText?: string;
    clearable?: boolean;
  }>(),
  {
    required: false,
    placeholder: 'Suchen…',
    emptyText: 'Keine Treffer',
    clearable: true,
  },
);

const inputText = ref('');

const optionByValue = computed(
  () => new Map(props.options.map((option) => [option.value, option])),
);

function displayValue(value: string | null) {
  if (!value) return '';
  return optionByValue.value.get(value)?.label ?? '';
}

function clearInput() {
  model.value = null;
  inputText.value = '';
}
</script>

<template>
  <ComboboxRoot
    v-slot="{ open }"
    v-model="model"
    :required="required"
    :ignore-filter="!inputText"
    open-on-click
    open-on-focus
    class="w-full"
  >
    <ComboboxAnchor as-child>
      <UiInputField :id="id" :label="label" :required="required">
        <ComboboxInput
          :id="id"
          v-model="inputText"
          :display-value="displayValue"
          :placeholder="placeholder"
          class="min-w-0 flex-1 bg-transparent outline-none"
        />
        <button
          v-if="clearable && inputText"
          type="button"
          class="shrink-0 cursor-pointer text-gray-400 hover:text-primary"
          aria-label="Eingabe löschen"
          @click="clearInput"
        >
          <XMarkIcon class="size-4" />
        </button>
        <ComboboxTrigger as-child>
          <button
            type="button"
            class="ml-1 shrink-0 cursor-pointer text-primary hover:text-primary-600"
            aria-label="Vorschläge öffnen"
          >
            <ChevronUpIcon v-if="open" class="size-4" />
            <ChevronDownIcon v-else class="size-4" />
          </button>
        </ComboboxTrigger>
      </UiInputField>
    </ComboboxAnchor>

    <ComboboxPortal>
      <ComboboxContent
        position="popper"
        side="bottom"
        :side-offset="4"
        class="z-[100] w-[var(--reka-combobox-trigger-width)] rounded-md border border-primary bg-surface p-1 shadow-md"
      >
        <ComboboxViewport class="max-h-60 overflow-y-auto">
          <ComboboxEmpty class="px-2 py-2 text-sm text-gray-500">
            {{ emptyText }}
          </ComboboxEmpty>
          <ComboboxItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :text-value="option.label"
            class="cursor-pointer rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-primary/10"
          >
            {{ option.label }}
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
