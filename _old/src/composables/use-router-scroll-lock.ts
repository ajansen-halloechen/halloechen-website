// src/composables/useSectionScrollLock.ts
import { ref } from 'vue';

const lockState = ref(false);

export function useRouterScrollLock() {
  function getLockState() {
    return lockState.value;
  }
  function lock() {
    lockState.value = true;
  }
  function release() {
    lockState.value = false;
  }

  return {
    getLockState,
    lock,
    release,
  };
}
