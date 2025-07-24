import React from 'react';
import {Outlet, Link} from 'react-router-dom';

const MainLayout = () => {
    return (
        <div>
            {/* Header */}
            <header style={styles.header}>
                <nav>
                    <Link className="anchor-tag" style={styles.link} to="/">Home</Link> |{" "}
                    <Link className="anchor-tag" style={styles.link} to="/product">Product</Link> |{" "}
                </nav>
            </header>

            {/* Main content */}
            <main style={styles.main}>
                <Outlet/>
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

        link: {
            color: '#fff'
        },

        main: {
            minHeight: '80vh',
            padding: '20px'
        },
        footer: {
            background: '#333',
            textAlign: 'center',
            padding: '10px',
            color: 'white'
        }
    }
;

export default MainLayout;
