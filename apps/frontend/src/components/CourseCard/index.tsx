import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Props {
  avatar: string;
  title: string;
  description: string;
  id: string;
  type?: string;
  featured?: boolean;
}

const cardBase =
  "relative block overflow-hidden rounded-[18px] cursor-pointer bg-[var(--color-surface-soft)] min-h-[340px] transition-[transform,box-shadow] duration-300 after:absolute after:inset-0 after:pointer-events-none after:content-[''] after:bg-[linear-gradient(to_top,rgba(14,8,4,0.9)_0%,rgba(14,8,4,0.4)_55%,transparent_100%)]";

const cardFeatured = "md:min-h-[420px] lg:min-h-0";

export function CourseCard(props: Props) {
  const { avatar, title, description, id, type, featured } = props;
  const avatarSrc =
    avatar ||
    "https://cf-images.us-east-1.prod.boltdns.net/v1/static/62009828001/c04c4184-85ef-4a71-9313-8a6ae90b1157/785c0b4b-fbae-48ac-8a74-cfabb0c3921c/1280x720/match/image.jpg";

  return (
    <Link to={`/courses/${id}`} className="link link--black">
      <motion.div
        className={`group h-full ${cardBase} ${featured ? cardFeatured : "h-[340px]"}`}
        whileHover={{
          y: -5,
          boxShadow: "0 24px 48px rgba(47, 26, 10, 0.22)",
          transition: { type: "spring", stiffness: 400, damping: 25 },
        }}
      >
        <img
          className="absolute inset-0 size-full object-cover transition-transform duration-[520ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.06]"
          src={avatarSrc}
          alt="Изображение курса"
        />
        <div className="absolute bottom-0 left-0 right-0 z-10 px-5 py-[22px] lg:px-6 lg:py-7">
          {type ? (
            <span className="mb-2 inline-block rounded-[var(--radius-xs)] bg-[var(--color-accent)] px-2 py-[3px] text-[10px] font-bold uppercase leading-none tracking-[0.08em] text-white">
              {type}
            </span>
          ) : null}
          <h3
            className={`mb-1.5 font-semibold leading-tight text-white m-0 [font-family:var(--font-ui)] ${
              featured ? "text-[18px] lg:text-[22px]" : "text-[18px]"
            }`}
          >
            {title}
          </h3>
          <p
            className={`m-0 text-[13px] leading-[1.4] text-white/65 line-clamp-2 ${
              featured ? "lg:line-clamp-3 lg:text-sm" : ""
            }`}
          >
            {description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
