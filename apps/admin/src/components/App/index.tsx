import React, { Component } from 'react'

interface AppProps {
  children?: React.ReactNode
}

class App extends Component<AppProps> {
  render () {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}

export default App