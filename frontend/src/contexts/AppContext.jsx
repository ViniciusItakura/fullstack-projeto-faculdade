import { createContext, useContext, useReducer, useEffect } from 'react';
import { reducer, initialState } from './appReducer.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('tmdb:token');
    const userStr = localStorage.getItem('tmdb:user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({ type: 'LOGIN_SUCCESS', user, token });
      } catch (e) {
        localStorage.removeItem('tmdb:token');
        localStorage.removeItem('tmdb:user');
      }
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
}



