export const initialState = {
  user: null,
  token: null,
  query: '',
  page: 1,
  totalPages: 0,
  results: [],
  loading: false,
  error: null,
  validationError: null,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.user,
        token: action.token,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
      };
    case 'SET_QUERY':
      return { ...state, query: action.query, page: 1, validationError: null };
    case 'SET_PAGE':
      return { ...state, page: action.page };
    case 'SET_VALIDATION_ERROR':
      return { ...state, validationError: action.error };
    case 'CLEAR_VALIDATION_ERROR':
      return { ...state, validationError: null };
    case 'FETCH_START':
      return { ...state, loading: true, error: null, validationError: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        validationError: null,
        results: action.results,
        totalPages: Math.min(action.totalPages || 0, 500),
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
}



