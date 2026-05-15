declare module 'h3' {
  interface H3EventContext {
    user?: import('#auth-utils').User;
  }
}

export {};
