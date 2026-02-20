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

    axios.post(url, data).then((response) => {
      if (response.status === 201) {
        console.log("Контент успешно создан");
        navigate(`/courses/${courseId}`);
      }
    });
  };

  const handleInputChange = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    const name = target.name;
    const value = target.value;
    setState({ ...state, [name]: value });
  };

  return (
    <form>
      <div className="form-group">
        <label htmlFor="exampleInputEmail1">Название</label>
        <input
          type="text"
          name="title"
          className="form-control"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
          placeholder="Название лекции"
          onChange={handleInputChange}
        />
        <small id="emailHelp" className="form-text text-muted">
          Мелкий шрифт
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="exampleInputEmail1">Порядковый номер</label>
        <input
          type="text"
          name="serial"
          className="form-control"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
          placeholder="Название лекции"
          onChange={handleInputChange}
        />
        <small id="emailHelp" className="form-text text-muted">
          Мелкий шрифт
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="exampleTextarea">Тело</label>
        <textarea
          className="form-control"
          name="body"
          id="exampleTextarea"
          rows={3}
          onChange={handleInputChange}
        />
      </div>

      <button type="submit" className="btn btn-success" onClick={handleSubmit}>
        Создать
      </button>
    </form>
  );
}

export default NewCourse;
