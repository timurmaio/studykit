import React, { Component } from 'react'
import Header from '../Header'
import Sidebar from '../Sidebar'

interface MainLayoutProps {
  children?: React.ReactNode
}

class MainLayout extends Component<MainLayoutProps> {
  render () {
    return (
      <div>
        <Header />
        <div className="container-fluid mt-3">
          <div className="row">
            <div className="col-2"><Sidebar /></div>
            <div className="col-10">{this.props.children}</div>
          </div>
        </div>
      </div>
    )
  }
}

export default MainLayout