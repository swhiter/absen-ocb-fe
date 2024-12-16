import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode} from "jwt-decode"; // Perbaikan impor

const VITE_API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    let isValid = true;
  let errorMessage = "";

  if (!username || username.trim() === "" || !password || password.trim() === "" ) {
    isValid = false;
    errorMessage += "Username Or Password  is required.\n";
  }
  if (!isValid) {
    alert(errorMessage);
    return; // Hentikan fungsi jika validasi gagal
  }


    try {
      const response = await axios.post(`${VITE_API_URL}/users/login-dashboard`, {
        username,
        password,
      });

      const token = response.data.token; // JWT dari server

      // Simpan token di LocalStorage
      localStorage.setItem("token", token);

      // Decode JWT dan simpan data ke sessionStorage
      const decoded = jwtDecode(token); // Mendekode token JWT
      sessionStorage.setItem("userData", JSON.stringify(decoded)); // Menyimpan payload token ke sessionStorage
    

      alert("Login successful!");
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      alert(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="container-scroller">
      <div className="container-fluid page-body-wrapper full-page-wrapper">
        <div className="content-wrapper d-flex align-items-center auth">
          <div className="row flex-grow">
            <div className="col-lg-4 mx-auto">
              <div className="auth-form-light text-left p-5">
                <div className="brand-logo">
                  <img src="logo_new.png" />
                </div>
                <h4>{`Hello! let's get started`}</h4>
                <h6 className="font-weight-light">Sign in to continue.</h6>
                <form className="pt-3" onSubmit={handleLogin}>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="mt-3 d-grid gap-2">
                    <button
                      className="btn btn-block btn-gradient-danger btn-lg font-weight-medium auth-form-btn"
                      type="submit"
                    >
                      SIGN IN
                    </button>
                  </div>
                  <div className="my-2 d-flex justify-content-between align-items-center"></div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
