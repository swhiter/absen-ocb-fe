import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Sidebar from "./Comppnents/Sidebar";
import Header from "./Comppnents/Header";
import Dashboard from "./Pages/Dashboard";
import Retail from "./Pages/Retail";
import Users from "./Pages/Users";
import Absensi from "./Pages/Absensi";
import Shift from "./Pages/Shift";
import ProtectedRoute from "./middleware/ProtectRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout tanpa Header dan Sidebar (misalnya untuk Login) */}
        <Route path="/login" element={<Login />} />

        {/* Layout dengan Header dan Sidebar */}
        <Route
          path="/*"
          element={
            <ProtectedRoute >
              <div className="container-scroller">
              <Header />
              <div className="container-fluid page-body-wrapper">
                <Sidebar />
                <div className="main-panel">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/absensi" element={<Absensi />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/retails" element={<Retail />} />
                    <Route path="/shifting" element={<Shift />} />
                  </Routes>
                </div>
              </div>
            </div>
          </ProtectedRoute>
            
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
