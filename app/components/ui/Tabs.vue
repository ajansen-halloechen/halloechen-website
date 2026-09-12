<script setup lang="ts">
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from 'reka-ui';
import { tv } from 'tailwind-variants';

const model = defineModel<string>({ required: true });

defineProps<{
  tabs: { value: string; label: string }[];
}>();

const tabsStyles = tv({
  slots: {
    list: 'flex justify-center gap-1 border-b border-primary',
    trigger: [
      'px-4 py-2 text-sm font-semibold text-primary/70 transition-colors',
      'border-b-2 border-transparent -mb-px',
      'hover:text-primary',
      'data-[state=active]:border-primary data-[state=active]:text-primary',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    ],
    content: 'pt-6 outline-none',
  },
});

const styles = tabsStyles();
</script>

<template>
  <TabsRoot v-model="model" class="flex flex-col">
    <TabsList :class="styles.list()">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :class="styles.trigger()"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="tab in tabs"
      :key="tab.value"
      :value="tab.value"
      :class="styles.content()"
    >
      <slot :name="tab.value" />
    </TabsContent>
  </TabsRoot>
</template>
