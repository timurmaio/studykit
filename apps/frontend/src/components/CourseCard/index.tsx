import { Link } from "react-router-dom";

interface Props {
  avatar: string;
  title: string;
  description: string;
  id: string;
  type?: string;
}

export function CourseCard(props: Props) {
  const { avatar, title, description, id, type } = props;
  const avatarSrc =
    avatar ||
    "https://cf-images.us-east-1.prod.boltdns.net/v1/static/62009828001/c04c4184-85ef-4a71-9313-8a6ae90b1157/785c0b4b-fbae-48ac-8a74-cfabb0c3921c/1280x720/match/image.jpg";

  return (
    <Link to={`/courses/${id}`} className="link link--black">
      <div className="course-card">
        <img className="course-card__img" src={avatarSrc} alt="Изображение курса" />
        <div className="course-card__overlay">
          {type ? <span className="course-card-badge">{type}</span> : null}
          <h3 className="course-card-title">{title}</h3>
          <p className="course-card-description">{description}</p>
        </div>
      </div>
    </Link>
  );
}
