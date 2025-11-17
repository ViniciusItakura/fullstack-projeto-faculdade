import { useEffect, useState } from 'react';
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
import { useApp } from '../contexts/AppContext.jsx';
import { searchMovies, insertMovie, logout } from '../utils/api.js';
import Login from './Login.jsx';

const IMG = (path) =>
  path
    ? `https://image.tmdb.org/t/p/w342${path}`
    : 'https://via.placeholder.com/342x513?text=Sem+Imagem';

function MovieCard({ movie, onInsert }) {
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
          variant="success"
          onClick={() => onInsert(movie)}
          size="sm"
          className="w-100"
        >
          Salvar
        </Button>
      </Card.Body>
    </Card>
  );
}

export default function App() {
  const { state, dispatch } = useApp();
  const { user, token, query, page, results, totalPages, loading, error, validationError } = state;
  const [insertLoading, setInsertLoading] = useState(false);
  const [insertMessage, setInsertMessage] = useState(null);

  useEffect(() => {
    if (!user || !token) return;
    
    if (!query?.trim()) {
      dispatch({ type: 'FETCH_SUCCESS', results: [], totalPages: 0 });
      return;
    }
    let abort = false;

    async function run() {
      dispatch({ type: 'FETCH_START' });
      try {
        const data = await searchMovies(query, page);
        if (abort) return;
        dispatch({
          type: 'FETCH_SUCCESS',
          results: data.results || [],
          totalPages: data.totalPages || 0,
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
  }, [query, page, user, token]);

  if (!user || !token) {
    return (
      <>
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand>CineVinicius</Navbar.Brand>
          </Container>
        </Navbar>
        <Login
          onLoginSuccess={(user, token) => {
            dispatch({ type: 'LOGIN_SUCCESS', user, token });
          }}
        />
      </>
    );
  }

  const validateSearch = (searchQuery) => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      return 'Por favor, digite um termo de busca.';
    }

    if (trimmedQuery.length < 2) {
      return 'O termo de busca deve ter pelo menos 2 caracteres.';
    }

    if (trimmedQuery.length > 100) {
      return 'O termo de busca deve ter no máximo 100 caracteres.';
    }

    return null;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const q = String(form.get('q') || '');

    const validationError = validateSearch(q);
    if (validationError) {
      dispatch({ type: 'SET_VALIDATION_ERROR', error: validationError });
      return;
    }

    dispatch({ type: 'CLEAR_VALIDATION_ERROR' });
    dispatch({ type: 'SET_QUERY', query: q.trim() });
  };

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages && p !== page) {
      dispatch({ type: 'SET_PAGE', page: p });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleInsert = async (movie) => {
    setInsertLoading(true);
    setInsertMessage(null);
    try {
      await insertMovie({
        tmdb_id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
      });
      setInsertMessage({ type: 'success', text: 'Filme salvo com sucesso!' });
    } catch (err) {
      setInsertMessage({ type: 'danger', text: err.message || 'Erro ao salvar filme' });
    } finally {
      setInsertLoading(false);
      setTimeout(() => setInsertMessage(null), 5000);
    }
  };

  const handleLogout = async () => {
    await logout();
    dispatch({ type: 'LOGOUT' });
  };

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
          <div className="d-flex align-items-center gap-3">
            <Badge bg="info" title="Usuário">
              {user.username}
            </Badge>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </Container>
      </Navbar>

      <Container className="pb-5">
        {insertMessage && (
          <Alert variant={insertMessage.type} className="mb-3" dismissible onClose={() => setInsertMessage(null)}>
            {insertMessage.text}
          </Alert>
        )}

        <Form onSubmit={handleSearch} className="mb-3" noValidate>
          <InputGroup>
            <Form.Control
              name="q"
              placeholder="Busque filmes (ex.: O Senhor dos Anéis)…"
              defaultValue={query}
              isInvalid={!!validationError}
              onFocus={() => dispatch({ type: 'CLEAR_VALIDATION_ERROR' })}
            />
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Buscar'}
            </Button>
          </InputGroup>
          {validationError && (
            <Alert variant="danger" className="mt-2 mb-0">
              <strong>Erro de validação:</strong> {validationError}
            </Alert>
          )}
        </Form>

        <Row className="mb-3">
          <Col>
            <div className="d-flex align-items-center gap-2">
              <h5 className="m-0">Resultados</h5>
              {loading && <Spinner animation="border" size="sm" />}
              {!loading && <Badge bg="secondary">{results.length}</Badge>}
            </div>
          </Col>
        </Row>

        {error && !validationError && (
          <Alert variant="danger" className="mb-3">
            Erro: {error}
          </Alert>
        )}

        {!results.length && !loading && query?.trim() && (
          <Alert variant="info">Nenhum filme encontrado para "{query}".</Alert>
        )}

        <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-3">
          {results.map((m) => (
            <Col key={m.id}>
              <MovieCard
                movie={m}
                onInsert={handleInsert}
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

