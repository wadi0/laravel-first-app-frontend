import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div>
      {/* Header */}
      <header style={styles.header}>
        <nav>
          <Link to="/">Home</Link> |{" "}
          <Link to="/product">Product</Link> |{" "}
        </nav>
      </header>

      {/* Main content */}
      <main style={styles.main}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2025 Wadi</p>
      </footer>
    </div>
  );
};

const styles = {
  header: {
    background: '#333',
    color: '#fff',
    padding: '10px 20px'
  },
  main: {
    minHeight: '80vh',
    padding: '20px'
  },
  footer: {
    background: '#eee',
    textAlign: 'center',
    padding: '10px'
  }
};

export default MainLayout;
