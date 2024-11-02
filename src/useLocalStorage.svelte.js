import { onMount } from 'svelte';

const useLocalStorage = (key, initialValue) => {
  let value = $state(initialValue);

  onMount(() => {
    const currentValue = localStorage.getItem(key);
    if (currentValue) value = JSON.parse(currentValue);
  });

  const save = () => {
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  };

  return {
    get value() {
      return value || initialValue;
    },
    set value(v) {
      value = v;
      save();
    },
  };
};

export default useLocalStorage;
