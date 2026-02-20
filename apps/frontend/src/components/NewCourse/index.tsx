import { SyntheticEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL, createAxios } from "../../config";

function NewCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    type: "MarkdownContent",
    serial: "",
    title: "",
    body: "",
  });

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();

    const axios = createAxios();
    const courseId = id;

    const url = API_URL + "/api/courses/" + courseId + "/content";

    const data = {
      course_content: {
        title: state.title,
        body: state.body,
        serial_number: state.serial,
        type: state.type,
      },
    };

    axios.post(url, data).then((response: any) => {
      if (response.status === 201) {
        console.log("Контент успешно создан");
        navigate(`/courses/${courseId}`);
      }
    });
  };

  const handleInputChange = (event: SyntheticEvent) => {
    const target = event.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const name = target.name;
    const value = target.value;
    setState({ ...state, [name]: value });
  };

  return (
    <form className="new-content-form" onSubmit={handleSubmit}>
      <div className="form-group mb-16">
        <label htmlFor="new-content-title" className="auth-form_label">
          Название
        </label>
        <input
          type="text"
          name="title"
          className="form-control"
          id="new-content-title"
          placeholder="Название лекции"
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group mb-16">
        <label htmlFor="new-content-serial" className="auth-form_label">
          Порядковый номер
        </label>
        <input
          type="text"
          name="serial"
          className="form-control"
          id="new-content-serial"
          placeholder="Например: 3"
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group mb-16">
        <label htmlFor="new-content-type" className="auth-form_label">
          Тип контента
        </label>
        <select
          className="form-control"
          name="type"
          id="new-content-type"
          value={state.type}
          onChange={handleInputChange}
        >
          <option value="MarkdownContent">Лекция</option>
          <option value="SqlProblemContent">Практика SQL</option>
        </select>
      </div>

      <div className="form-group mb-20">
        <label htmlFor="new-content-body" className="auth-form_label">
          Содержимое
        </label>
        <textarea
          className="form-control"
          name="body"
          id="new-content-body"
          rows={6}
          onChange={handleInputChange}
        />
      </div>

      <button type="submit" className="button auth-form_submit">
        Создать
      </button>
    </form>
  );
}

export default NewCourse;
