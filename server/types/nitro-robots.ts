import type { RobotsValue } from '@nuxtjs/robots';

type RobotsRouteRule = RobotsValue | {
  indexable: boolean;
  rule: string;
};

declare module 'nitropack' {
  interface NitroRouteConfig {
    robots?: RobotsRouteRule;
  }

  interface NitroRouteRules {
    robots?: RobotsRouteRule;
  }
}

declare module 'nitropack/types' {
  interface NitroRouteConfig {
    robots?: RobotsRouteRule;
  }

  interface NitroRouteRules {
    robots?: RobotsRouteRule;
  }
}

export {};
