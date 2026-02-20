import React, { Component } from 'react';
import { Link } from 'react-router';
import { API_URL, axios } from '../../../config'

interface Course {
  id: number
  title: string
  description: string
  owner_id: number
}

interface ListCoursesState {
  items: Course[]
}

interface ListCoursesProps {
  // TODO: уточнить тип пропсов, если они есть
}

class ListCourses extends Component<ListCoursesProps, ListCoursesState> {
  constructor (props: ListCoursesProps) {
    super(props)
    this.state = {
      items: []
    }
  }

  componentDidMount () {
    axios.get(API_URL + '/api/admin/courses')
      .then((response) => {
        this.setState({ items: response.data })
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleDelete = (item: Course) => {
    axios.delete(API_URL + '/api/admin/courses/' + item.id).then((response) => {
      if (response.status === 204) {
        console.log('Курс успешно удалён')
        let newState = this.state.items
        if (newState.indexOf(item) > -1) {
          newState.splice(newState.indexOf(item), 1)
          this.setState({ items: newState })
        }
      }
    })
  }

  renderItem = (item: Course) => {
    return (
      <tr key={item.id}>
        <th scope="row">{item.id}</th>
        <td>{item.title}</td>
        <td>{item.description}</td>
        <td>{item.owner_id}</td>
        <td>
          <div className="btn-group btn-group-sm" role="group">
            <Link to={{ pathname: `courses/${item.id}` }} className="btn btn-outline-info">
              Показать
            </Link>
            <button type="button" className="btn btn-outline-danger" onClick={this.handleDelete.bind(this, item)}>
              Удалить
            </button>
          </div>
        </td>
      </tr>
    )
  }

  render () {
    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Описание</th>
              <th>Владелец</th>
              <th>Действия</th>
              {/*<th>Аватар</th>*/}
            </tr>
          </thead>
          <tbody>
            {this.state.items.map(this.renderItem)}
          </tbody>
        </table>
        <Link to="/courses/new" className="btn btn-success mt-3">Создать</Link>
      </div>
    );
  }
}

export default ListCourses