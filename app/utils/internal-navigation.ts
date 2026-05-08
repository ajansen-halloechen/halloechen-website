import type { TopBarItem } from "~/components/TopBar.vue";

const internalNavItems: TopBarItem[] = [
  {
    id: "zeiterfassung",
    label: "Zeiterfassung",
    to: "/internal/zeiterfassung",
  },
  { id: "schichten", label: "Schichten", to: "/internal/schichten" },
  { id: "rechnungen", label: "Rechnungen", to: "/internal/rechnungen" },
];

export { internalNavItems };
