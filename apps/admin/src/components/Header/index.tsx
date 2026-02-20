import React, { Component } from 'react'
import { Link } from 'react-router'

interface HeaderProps {
  // TODO: уточнить тип пропсов, если они есть
}

class Header extends Component<HeaderProps> {
  handleSignout = () => {
    localStorage.removeItem('jwt_token')
  }

  render () {
    return (
      <div className="container-fluid pb-5">
        <nav className="navbar fixed-top navbar-light flex-row bg-faded align-items-center">
          <h1 className="navbar-brand mb-0">Studykit Admin</h1>
          <Link to='/' className="ml-auto" onClick={this.handleSignout}>Выйти</Link>
        </nav>
      </div>
    )
  }
}

export default Header