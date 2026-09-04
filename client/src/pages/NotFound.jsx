import Button from '../components/Button';

const NotFound = () => {
  return (
    <div className="container page">
      <div className="empty-state not-found">
        <p className="code-404">404</p>
        <h1>Page not found</h1>
        <p className="muted">The page you are looking for does not exist or has moved.</p>
        <Button to="/">Back to home</Button>
      </div>
    </div>
  );
};

export default NotFound;
