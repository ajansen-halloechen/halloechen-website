import type { RobotsValue } from '@nuxtjs/robots';

declare module 'nitropack/types' {
  interface NitroRouteConfig {
    robots?: RobotsValue | {
      indexable: boolean;
      rule: string;
    };
  }
}

export {};
