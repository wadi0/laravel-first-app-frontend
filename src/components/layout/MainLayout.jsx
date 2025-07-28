import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../navbar/Navbar.jsx';
import Sidebar from '../sidebar/Sidebar.jsx';

const MainLayout = () => {
  return (
    <div className="layout-container" style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* Header */}
      <Navbar />

      {/* Sidebar + Content */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/*<Sidebar />*/}

        <main style={{ flex: 1, padding: '20px' }}>
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '10px', background: '#f0f0f0' }}>
        <p>© 2025 Wadi</p>
      </footer>
    </div>
  );
};

export default MainLayout;




// import React from 'react';
// import {Outlet, Link} from 'react-router-dom';
//
// const MainLayout = () => {
//     return (
//         <div>
//             {/* Header */}
//             <header style={styles.header}>
//                 <nav>
//                     <Link className="anchor-tag" style={styles.link} to="/">Home</Link> |{" "}
//                     <Link className="anchor-tag" style={styles.link} to="/product">Product</Link> |{" "}
//                 </nav>
//             </header>
//
//             {/* Main content */}
//             <main style={styles.main}>
//                 <Outlet/>
//             </main>
//
//             {/* Footer */}
//             <footer style={styles.footer}>
//                 <p>© 2025 Wadi</p>
//             </footer>
//         </div>
//     );
// };
//
// const styles = {
//         header: {
//             background: '#333',
//             color: '#fff',
//             padding: '10px 20px'
//         },
//
//         link: {
//             color: '#fff'
//         },
//
//         main: {
//             minHeight: '80vh',
//             padding: '20px'
//         },
//         footer: {
//             background: '#333',
//             textAlign: 'center',
//             padding: '10px',
//             color: 'white'
//         }
//     }
// ;
//
// export default MainLayout;
