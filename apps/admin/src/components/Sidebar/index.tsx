import React, { Component } from 'react'
import { Link } from 'react-router'

interface SidebarProps {
  // TODO: уточнить тип пропсов, если они есть
}

class Sidebar extends Component<SidebarProps> {
  render () {
    return (
      <div className="sidebar">
        <nav className="nav flex-column nav-pills">
          <Link to="/courses" className="nav-link" activeClassName="active">Курсы</Link>
          <Link to="/users" className="nav-link" activeClassName="active">Пользователи</Link>
          <Link to="/articles" className="nav-link" activeClassName="active">Новости</Link>
          <Link to="/lectures" className="nav-link" activeClassName="active">Лекции</Link>
          <Link to="/course_contents" className="nav-link" activeClassName="active">Контент лекции</Link>
        </nav>
      </div>
    )
  }
}

export default Sidebar