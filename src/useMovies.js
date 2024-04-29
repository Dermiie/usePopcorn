import { useState } from 'react';
import { useEffect } from 'react';

const KEY = 'ee0844bf';

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(
    function () {
      const controller = new AbortController();
      const fetchMovies = async function () {
        try {
          setError(false);
          setIsLoading(true);
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok) throw new Error('Something went wrong');
          const data = await res.json();
          if (data.Response === 'False')
            throw new Error('Could not fetch movie');
          setMovies(data.Search);
          setError(false);
        } catch (err) {
          if (err.name !== 'AbortError') {
            setError(err.message);
          }
          // setMovies(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      if (query.length < 3) {
        setMovies([]);
        setError(false);
        return;
      }

      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return { movies, isLoading, error };
}
