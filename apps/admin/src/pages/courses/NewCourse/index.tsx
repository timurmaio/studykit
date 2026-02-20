import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import { API_URL, axios } from '../../../config'

interface NewCourseState {
  title: string
  description: string
  error: string
}

interface NewCourseProps {
  // TODO: уточнить тип пропсов, если они есть
}

class NewCourse extends Component<NewCourseProps, NewCourseState> {
  constructor(props: NewCourseProps) {
    super(props)
    this.state = {
      title: '',
      description: '',
      error: ''
    }
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    const name = target.name
    const value = target.value
    this.setState({ [name]: value } as Pick<NewCourseState, keyof NewCourseState>)
  }

  handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const url = API_URL + '/api/admin/courses'

    const data = {
      course: {
        title: this.state.title,
        description: this.state.description,
        owner_id: 1
      }
    }

    axios.post(url, data).then((response) => {
      if (response.status === 201) {
        console.log('Курс создан')
        browserHistory.push('/courses')
      }
    }).catch((error) => {
      this.setState({ error: String(error) })
      console.log('Ошибка создания курса')
    })
  }

  render () {
    return (
      <div>
        <h3>Новый курс</h3>
        <form>
          <div className="form-group w-50">
            <label htmlFor="title">Название</label>
            <input name="title" type="text" className="form-control" onChange={this.handleInputChange} id="title" aria-describedby="emailHelp" placeholder="Название курса" />
          </div>
          <div className="form-group w-50">
            <label htmlFor="description">Описание</label>
            <input name="description" type="text" className="form-control" onChange={this.handleInputChange} id="description" placeholder="Описание курса" />
          </div>
          <button type="submit" className="btn btn-primary" onClick={this.handleSubmit}>Создать</button>
          <span>{this.state.error}</span>
        </form>
      </div>
    )
  }
}

export default NewCourse
