import type { RouteLocationRaw } from 'vue-router';
import type { Component } from 'vue';

export interface TopBarItem {
  id: string;
  label: string;
  icon?: Component;
  imageUrl?: string | null;
  tooltip?: string;
  to: RouteLocationRaw;
}
