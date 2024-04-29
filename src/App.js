// import { findByDisplayValue } from '@testing-library/react';
import { useEffect, useRef, useState } from 'react';
import StarRating from './StarRating';
import { useMovies } from './useMovies';
import { useLocalStorageState } from './useLocalStorageState';

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = 'ee0844bf';

export default function App() {
  const [query, setQuery] = useState('');
  //custom hook useMovies for fetching data from an api
  const { movies, isLoading, error } = useMovies(query, handleCloseMovie);
  //Retriving state from localstorage, using custom hook useLocalStorage
  const [watched, setWatched] = useLocalStorageState([], 'watched');

  const [selectedMovie, setSelectedMovie] = useState(null);

  function handleClick(id) {
    setSelectedMovie((selectedID) => (id === selectedID ? null : id));
  }

  function handleCloseMovie() {
    setSelectedMovie(null);
  }

  function handleAddWatchedMovie(movie) {
    setWatched(() => [...watched, movie]);
  }

  function handleDeletedWatchedMovies(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <Nav>
        <SearchBar query={query} setQuery={setQuery}></SearchBar>
        <NumOfResult movies={movies}></NumOfResult>
      </Nav>
      <Main>
        <Box>
          {isLoading && <Loader></Loader>}
          {error && <ErrorMessage message={error}></ErrorMessage>}
          {!isLoading && !error && (
            <MovieList
              handleClick={handleClick}
              movies={movies}
              setSelectedMovie={setSelectedMovie}
            ></MovieList>
          )}
        </Box>
        <Box>
          {selectedMovie ? (
            <MovieDetails
              selectedId={selectedMovie}
              handleCloseMovie={handleCloseMovie}
              onAddWatchedMovie={handleAddWatchedMovie}
              watched={watched}
            ></MovieDetails>
          ) : (
            <>
              <WatchedSummary watched={watched}></WatchedSummary>
              <WatchedMoviesList
                watched={watched}
                onDeleteWatchedMovies={handleDeletedWatchedMovies}
              ></WatchedMoviesList>
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Nav({ children }) {
  return (
    <nav className="nav-bar">
      <Logo></Logo>
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function SearchBar({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(
    function () {
      const callback = function (e) {
        if (document.activeElement === inputEl) return;
        if (e.code === 'Enter') {
          inputEl.current.focus();
          setQuery('');
        }
      };
      document.addEventListener('keydown', callback);

      return function () {
        document.removeEventListener('keydown', callback);
      };
    },
    [setQuery]
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumOfResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? '–' : '+'}
      </button>
      {isOpen && children}
    </div>
  );
}

function Loader() {
  return <p className="loader">LOADING...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}
// function WatchedList() {
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? '–' : '+'}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedSummary watched={watched}></WatchedSummary>
//           <WatchedMoviesList watched={watched}></WatchedMoviesList>
//         </>
//       )}
//     </div>
//   );
// }

function MovieList({ movies, handleClick }) {
  return (
    <ul className="list list-import list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleClick={handleClick}
        ></Movie>
      ))}
    </ul>
  );
}

function Movie({ movie, handleClick }) {
  return (
    <li onClick={() => handleClick(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({
  selectedId,
  handleCloseMovie,
  onAddWatchedMovie,
  watched,
}) {
  const [movie, setMovie] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');

  const countUsersDecision = useRef(null);

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  const isWatchedRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const handleAddWatchedMovie = function () {
    const newMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
      countUsersDecision: countUsersDecision.current,
    };

    onAddWatchedMovie(newMovie);
    handleCloseMovie();
  };

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: directors,
    Genre: genre,
  } = movie;

  useEffect(
    function () {
      if (userRating) {
        countUsersDecision.current = countUsersDecision.current + 1;
      }
    },
    [userRating]
  );

  useEffect(
    function () {
      async function fetchedMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );

        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }

      fetchedMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = 'usePopcorn';
      };
    },
    [title]
  );

  //Handling key press event in React

  useEffect(
    function () {
      const callback = function (e) {
        if (e.code === 'Escape') {
          handleCloseMovie();
        }
      };
      document.addEventListener('keydown', callback);
      //Always clean up this type of effect to prevent pile up of event listeners on the DOM
      return function () {
        document.removeEventListener('keydown', callback);
      };
    },
    [handleCloseMovie]
  );

  return (
    <>
      {isLoading ? (
        <Loader></Loader>
      ) : (
        <>
          {' '}
          <div className="details">
            <header>
              <img src={poster} alt="movie poseter"></img>
              <div className="details-overview">
                <h2>{title}</h2>
                <p>{released} &bull;</p>
                <p>{genre}</p>
                <p>
                  <span>⭐</span>
                  {imdbRating} IMDb rating
                </p>
              </div>
            </header>

            <section>
              <div className="rating">
                {!isWatched ? (
                  <>
                    {' '}
                    <StarRating
                      onSetRating={setUserRating}
                      maxRating={10}
                      size={20}
                    >
                      {' '}
                    </StarRating>
                    {userRating > 0 && (
                      <button
                        className="btn-add"
                        onClick={handleAddWatchedMovie}
                      >
                        Add to list
                      </button>
                    )}
                  </>
                ) : (
                  <p>You've rated it {isWatchedRating}</p>
                )}
              </div>
              <p>{plot}</p>
              <p>Starring: {actors}</p>
              <p>Directed by: {directors}</p>
            </section>
          </div>
          <button className="btn-back" onClick={handleCloseMovie}>
            &larr;
          </button>
        </>
      )}
    </>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{Math.round(avgImdbRating)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{Math.round(avgUserRating)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{Math.round(avgRuntime)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatchedMovies }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatchedMovies={onDeleteWatchedMovies}
        ></WatchedMovie>
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatchedMovies }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatchedMovies(movie.imdbID)}
        >
          {' '}
          -{' '}
        </button>
      </div>
    </li>
  );
}
