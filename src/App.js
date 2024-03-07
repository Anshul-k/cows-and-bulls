import Login from "./Pages/Login";
import Register from "./Pages/Register";
import "./style.scss";
import { AuthProvider } from "./Contexts/AuthContexts";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import LandingPage from "./Pages/LandingPage";
import SoloGame from "./Pages/SoloGame";
import { useParams } from "react-router-dom";
import MultiGame from "./Pages/MultiGame";
import PrivateRoute from "./Pages/PrivateRoute";
import Rules from "./Pages/Rules";

function App() {
  const { digits, gameId } = useParams();
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route exact path="*" element={<LandingPage />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/home" element={<Home />} />
          <Route
            path="/solo/:digits/:gameId"
            element={
              <PrivateRoute originalURL={window.location.pathname}>
                <SoloGame />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/multi/:digits/:gameId"
            element={
              <PrivateRoute originalURL={window.location.pathname}>
                <MultiGame />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rules"
            element={
              <PrivateRoute originalURL={window.location.pathname}>
                <Rules />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
