export const initialState = {
  query: '',
  page: 1,
  totalPages: 0,
  results: [],
  loading: false,
  error: null,
  favorites: {},
};

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.query, page: 1 };
    case 'SET_PAGE':
      return { ...state, page: action.page };
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        results: action.results,
        totalPages: Math.min(action.totalPages || 0, 500),
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error };
    case 'LOAD_FAVORITES':
      return { ...state, favorites: action.favorites || {} };
    case 'TOGGLE_FAVORITE': {
      const favs = { ...state.favorites };
      if (favs[action.movie.id]) delete favs[action.movie.id];
      else favs[action.movie.id] = action.movie;
      localStorage.setItem('tmdb:favorites', JSON.stringify(favs));
      return { ...state, favorites: favs };
    }
    default:
      return state;
  }
}
