import React, { Component } from 'react'
import styled from 'styled-components'

const Flex = styled.div`
  display: flex;
  height: 100vh;
`

interface AuthLayoutProps {
  children?: React.ReactNode
}

class AuthLayout extends Component<AuthLayoutProps> {
  render () {
    return (
      <Flex>
        {this.props.children}
      </Flex>
    )
  }
}

export default AuthLayout