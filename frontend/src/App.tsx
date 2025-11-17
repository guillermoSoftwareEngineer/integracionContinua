import { AppBar, Container, Toolbar, Typography } from '@mui/material'
import { Link, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Spendr
          </Typography>
          <nav>
            <Link to="/" className="mr-4 text-white">
              Home
            </Link>
            <Link to="/movements" className="text-white">
              Movements
            </Link>
          </nav>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </div>
  )
}
