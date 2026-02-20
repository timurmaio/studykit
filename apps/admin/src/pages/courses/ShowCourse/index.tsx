import React, { Component } from 'react'
import { API_URL, axios } from '../../../config'

interface ShowCourseState {
  title: string
  description: string
  owner: string
  editable: boolean
  error: string
}

interface ShowCourseProps {
  params: {
    id: string
  }
}

class ShowCourse extends Component<ShowCourseProps, ShowCourseState> {
  constructor (props: ShowCourseProps) {
    super(props)
    this.state = {
      title: '',
      description: '',
      owner: '',
      editable: false,
      error: ''
    }
  }

  componentDidMount () {
    axios.get(API_URL + '/api/admin/courses/' + this.props.params.id).then((response) => {
      const item = response.data
      console.log(response.data)
      this.setState({ title: item.title, description: item.description })
    })
  }

  handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    this.setState({ editable: !this.state.editable })
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    const name = target.name
    const value = target.value
    this.setState({ [name]: value } as unknown as Pick<ShowCourseState, 'title' | 'description'>)
  }

  handleEditSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const url = API_URL + '/api/admin/courses/' + + this.props.params.id

    const data = {
      course: {
        title: this.state.title,
        description: this.state.description
      }
    }

    axios.put(url, data).then((response) => {
      console.log(response)
      if (response.status === 200) {
        this.setState({ editable: !this.state.editable })
      }
    })
  }

  render () {
    const disabled = this.state.editable ? false : true
    const button = this.state.editable ? 
    <button type="submit" className="btn btn-success" onClick={this.handleEditSubmit}>Сохранить</button> 
    : 
    <button type="submit" className="btn btn-warning" onClick={this.handleEdit}>Изменить</button>
    return (
      <div>
        <h3>{this.props.params.id}й курс</h3>
        <form>
          <div className="form-group w-50">
            <label htmlFor="title">Название</label>
            <input name="title" type="text" className="form-control" value={this.state.title} onChange={this.handleInputChange} id="title" aria-describedby="emailHelp" disabled={disabled} />
          </div>
          <div className="form-group w-50">
            <label htmlFor="description">Описание</label>
            <input name="description" type="text" className="form-control" value={this.state.description} onChange={this.handleInputChange} id="description" disabled={disabled}/>
          </div>
          {button}
        </form>
      </div>
    )
  }
}

export default ShowCourse
