import { useEffect, useReducer } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Navbar,
  Pagination,
  Badge,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { reducer, initialState } from '../contexts/appReducer.js';

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const IMG = (path) =>
  path
    ? `https://image.tmdb.org/t/p/w342${path}`
    : 'https://via.placeholder.com/342x513?text=Sem+Imagem';

function MovieCard({ movie, isFavorite, onToggleFavorite }) {
  const { title, poster_path, release_date, vote_average, overview } = movie;
  return (
    <Card className="h-100 shadow-sm">
      <Card.Img variant="top" src={IMG(poster_path)} alt={title} />
      <Card.Body className="d-flex flex-column">
        <Card.Title className="mb-1" title={title}>
          {title}{' '}
          {vote_average ? (
            <Badge bg="secondary" title="Nota média">
              {vote_average.toFixed(1)}
            </Badge>
          ) : null}
        </Card.Title>
        <Card.Subtitle className="text-muted mb-2">
          {release_date
            ? new Date(release_date).toLocaleDateString('pt-BR')
            : '—'}
        </Card.Subtitle>
        <Card.Text className="flex-grow-1" style={{ fontSize: 14 }}>
          {overview
            ? overview.slice(0, 160) + (overview.length > 160 ? '…' : '')
            : 'Sem sinopse.'}
        </Card.Text>
        <Button
          variant={isFavorite ? 'outline-danger' : 'primary'}
          onClick={() => onToggleFavorite(movie)}
        >
          {isFavorite ? 'Remover dos Favoritos' : 'Favoritar'}
        </Button>
      </Card.Body>
    </Card>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { query, page, results, totalPages, loading, error, favorites } = state;

  useEffect(() => {
    const saved = localStorage.getItem('tmdb:favorites');
    if (saved) {
      try {
        dispatch({ type: 'LOAD_FAVORITES', favorites: JSON.parse(saved) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!query?.trim()) {
      dispatch({ type: 'FETCH_SUCCESS', results: [], totalPages: 0 });
      return;
    }
    let abort = false;

    async function run() {
      dispatch({ type: 'FETCH_START' });
      try {
        const url = new URL('https://api.themoviedb.org/3/search/movie');
        url.searchParams.set('api_key', TMDB_KEY);
        url.searchParams.set('query', query);
        url.searchParams.set('page', String(page));
        url.searchParams.set('include_adult', 'false');
        url.searchParams.set('language', 'pt-BR');
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();
        if (abort) return;
        dispatch({
          type: 'FETCH_SUCCESS',
          results: data.results || [],
          totalPages: data.total_pages || 0,
        });
      } catch (e) {
        if (abort) return;
        dispatch({
          type: 'FETCH_ERROR',
          error: e.message || 'Falha ao buscar.',
        });
      }
    }
    run();
    return () => {
      abort = true;
    };
  }, [query, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const q = String(form.get('q') || '');
    dispatch({ type: 'SET_QUERY', query: q });
  };

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages && p !== page) {
      dispatch({ type: 'SET_PAGE', page: p });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isFav = (id) => Boolean(favorites[id]);

  const pages = (() => {
    const items = [];
    const start = Math.max(1, page - 4);
    const end = Math.min(totalPages, start + 9);
    if (totalPages > 0) {
      items.push(
        <Pagination.First
          key="first"
          disabled={page === 1}
          onClick={() => handlePageChange(1)}
        />,
        <Pagination.Prev
          key="prev"
          disabled={page === 1}
          onClick={() => handlePageChange(page - 1)}
        />,
      );
      for (let p = start; p <= end; p++) {
        items.push(
          <Pagination.Item
            key={p}
            active={p === page}
            onClick={() => handlePageChange(p)}
          >
            {p}
          </Pagination.Item>,
        );
      }
      items.push(
        <Pagination.Next
          key="next"
          disabled={page === totalPages}
          onClick={() => handlePageChange(page + 1)}
        />,
        <Pagination.Last
          key="last"
          disabled={page === totalPages}
          onClick={() => handlePageChange(totalPages)}
        />,
      );
    }
    return items;
  })();

  return (
    <>
      <Navbar bg="dark" variant="dark" className="mb-3">
        <Container>
          <Navbar.Brand>CineVinicius</Navbar.Brand>
          <Badge bg="info" title="Autor" className="ms-auto">
            Vinicius Enrique Pinheiro Itakura
          </Badge>
        </Container>
      </Navbar>

      <Container className="pb-5">
        <Form onSubmit={handleSearch} className="mb-3">
          <InputGroup>
            <Form.Control
              name="q"
              placeholder="Busque filmes (ex.: O Senhor dos Anéis)…"
              defaultValue={query}
            />
            <Button type="submit" variant="primary">
              Buscar
            </Button>
          </InputGroup>
        </Form>

        <Row className="mb-3">
          <Col>
            <div className="d-flex align-items-center gap-2">
              <h5 className="m-0">Resultados</h5>
              {loading && <Spinner animation="border" size="sm" />}
              {!loading && <Badge bg="secondary">{results.length}</Badge>}
            </div>
          </Col>
          <Col className="text-end">
            <Badge bg="warning" text="dark" title="Qtde de favoritos">
              ❤️ {Object.keys(favorites).length}
            </Badge>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mb-3">
            Erro: {error}
          </Alert>
        )}

        {!results.length && !loading && query?.trim() && (
          <Alert variant="info">Nenhum filme encontrado para “{query}”.</Alert>
        )}

        <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-3">
          {results.map((m) => (
            <Col key={m.id}>
              <MovieCard
                movie={m}
                isFavorite={isFav(m.id)}
                onToggleFavorite={(movie) =>
                  dispatch({ type: 'TOGGLE_FAVORITE', movie })
                }
              />
            </Col>
          ))}
        </Row>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination>{pages}</Pagination>
          </div>
        )}

        {!query && (
          <Alert variant="secondary" className="mt-4">
            Dica: comece buscando um título. Ex.: <strong>Matrix</strong>,{' '}
            <strong>Harry Potter</strong>, <strong>Oppenheimer</strong>.
          </Alert>
        )}
      </Container>
    </>
  );
}
