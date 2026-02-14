import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Register from './components/Register'
import './App.css'

function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h1>Ứng dụng web</h1>
      <p>Chào mừng bạn đến với ứng dụng của chúng tôi</p>
      <nav style={{ marginTop: '20px' }}>
        <Link to="/register" style={{ marginRight: '20px', textDecoration: 'none', color: '#2563eb' }}>
          Đăng ký
        </Link>
        <Link to="/login" style={{ textDecoration: 'none', color: '#2563eb' }}>
          Đăng nhập
        </Link>
      </nav>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
