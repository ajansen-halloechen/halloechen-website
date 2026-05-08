import { ArrowRightStartOnRectangleIcon } from "@heroicons/vue/24/outline";
import type { TopBarItem } from "~/components/TopBar.vue";

const internalNavItems: TopBarItem[] = [
  {
    id: "zeiterfassung",
    label: "Zeiterfassung",
    to: "/internal/zeiterfassung",
  },
  { id: "schichten", label: "Schichten", to: "/internal/schichten" },
  { id: "rechnungen", label: "Rechnungen", to: "/internal/rechnungen" },
  {
    id: "logout",
    label: "",
    icon: ArrowRightStartOnRectangleIcon,
    tooltip: "Logout",
    to: "/",
  },
];

export { internalNavItems };
