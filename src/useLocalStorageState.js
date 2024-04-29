import { useState } from 'react';
import { useEffect } from 'react';

export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(function () {
    const storedMovie = localStorage.getItem(key);
    if (storedMovie === null) return initialState;
    return JSON.parse(storedMovie);
  });

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );

  return [value, setValue];
}
