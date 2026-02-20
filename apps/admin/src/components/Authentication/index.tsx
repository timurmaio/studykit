import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import styled from 'styled-components';
import axios from 'axios'
import { API_URL } from '../../config'

const Input = styled.input`
  display: block;
  padding: 5px;
  font-size: 14px;
  border: 1px solid grey;
  border-radius: 4px;
  width: 100%;
`

const Form = styled.form`
  margin: auto;
  width: 250px;
`

interface AuthenticationState {
  email: string
  password: string
  error: any // TODO: уточнить тип ошибки
}

interface AuthenticationProps {
  // TODO: уточнить тип пропсов, если они есть
}

class Authentication extends Component<AuthenticationProps, AuthenticationState> {
  constructor (props: AuthenticationProps) {
    super(props)
    this.state = {
      email: '',
      password: '',
      error: ''
    }
  }

  componentDidMount () {
    if (localStorage.getItem('jwt_token')) {
      browserHistory.push('/courses')
    }
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    const name = target.name
    const value = target.value

    this.setState({ [name]: value } as Pick<AuthenticationState, keyof AuthenticationState>)
  }

  handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    const url = API_URL + '/api/users/login'

    const userData = {
      user: {
        email: this.state.email,
        password: this.state.password
      }
    }

    // const _this = this

    axios.post(url, userData).then((response) => {
      if (response.status === 200) {
        console.log('Мы вошли!')
        const jwt_token = response.data.jwt_token
        // XSS vulnerability
        localStorage.setItem('jwt_token', jwt_token)
        browserHistory.push('/courses')
      }
    }).catch((error) => {
      console.log(error)
      this.setState({error: error})
      console.log('Введены неверные данные')
    })
  }

  render () {
    const error = this.state.error ? this.state.error.toString() : undefined
    return (
      <Form>

        <label>Пользователь:</label>
        <Input placeholder="Введите пользователя" type="text" name="email" onChange={this.handleInputChange} />

        <label>Пароль:</label>
        <Input placeholder="Введите пароль" type="password" name="password" onChange={this.handleInputChange} />
        
        <div>{error}</div>
        
        <button type='submit' onClick={this.handleSubmit}>Войти</button>

      </Form>
    )
  }
}

export default Authentication
