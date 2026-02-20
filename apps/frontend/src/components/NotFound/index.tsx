import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="container not-found-page">
      <div className="panel not-found-card">
        <p className="not-found-kicker mb-8">404</p>
        <h1 className="not-found-title mb-12">Страница не найдена</h1>
        <p className="not-found-text mb-24">
          Возможно, ссылка устарела. Вернитесь в каталог и продолжайте обучение.
        </p>
        <Link to="/courses" className="button not-found-button">
          К курсам
        </Link>
      </div>
    </div>
  );
}
