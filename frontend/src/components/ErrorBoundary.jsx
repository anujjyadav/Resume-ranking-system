import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary caught]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          maxWidth: '600px', margin: '80px auto', padding: '32px 24px', textAlign: 'center',
          background: '#fff', border: '1px solid #E0DFDC', borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', background: '#FAF0EE',
            border: '1px solid #E8AFA3', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.4rem'
          }}>!</div>
          <h3 style={{ marginBottom: '8px', color: '#191919' }}>Something went wrong</h3>
          <p style={{ fontSize: '0.875rem', color: '#56687A', marginBottom: '20px' }}>
            {this.state.message}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
