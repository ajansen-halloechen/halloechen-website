<script setup lang="ts">
import {
    AutocompleteAnchor,
    AutocompleteContent,
    AutocompleteEmpty,
    AutocompleteInput,
    AutocompleteItem,
    AutocompletePortal,
    AutocompleteRoot,
    AutocompleteTrigger,
    AutocompleteViewport,
} from 'reka-ui';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/24/outline';

const model = defineModel<string>({ required: true });

withDefaults(
    defineProps<{
        id: string;
        label: string;
        options: string[];
        required?: boolean;
        placeholder?: string;
        emptyText?: string;
    }>(),
    {
        required: false,
        placeholder: '',
        emptyText: 'Keine Aktivität gefunden',
    },
);
</script>

<template>
    <AutocompleteRoot v-slot="{ open }" v-model="model" :required="required" class="w-full" open-on-click open-on-focus>
        <AutocompleteAnchor as-child>
            <UiInputField :id="id" :label="label" :required="required">
                <AutocompleteInput :id="id" :placeholder="placeholder"
                    class="min-w-0 flex-1 bg-transparent outline-none" />
                <AutocompleteTrigger as-child>
                    <button type="button" class="ml-auto shrink-0 cursor-pointer text-primary hover:text-primary-600"
                        aria-label="Vorschläge öffnen">
                        <ChevronUpIcon v-if="open" class="size-4" />
                        <ChevronDownIcon v-else class="size-4" />
                    </button>
                </AutocompleteTrigger>
            </UiInputField>
        </AutocompleteAnchor>

        <AutocompletePortal>
            <AutocompleteContent position="popper" side="bottom" :side-offset="4" hide-when-empty
                class="z-[60] w-[var(--reka-combobox-trigger-width)] rounded-md border border-primary bg-surface p-1 shadow-md">
                <AutocompleteViewport class="max-h-60 overflow-y-auto">
                    <AutocompleteEmpty class="px-2 py-2 text-sm text-gray-500">
                        {{ emptyText }}
                    </AutocompleteEmpty>
                    <AutocompleteItem v-for="option in options" :key="option" :value="option"
                        class="cursor-pointer rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-primary/10">
                        {{ option }}
                    </AutocompleteItem>
                </AutocompleteViewport>
            </AutocompleteContent>
        </AutocompletePortal>
    </AutocompleteRoot>
</template>
