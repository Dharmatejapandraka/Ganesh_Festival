import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Layout from "./components/Layout";


// =====================================================
// PAGES
// =====================================================

import Login from "./pages/Login";
import Register from "./pages/Register";

import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Committee from "./pages/Committee";
import Villagers from "./pages/Villagers";
import Donations from "./pages/Donations";
import Expenses from "./pages/Expenses";
import DJSets from "./pages/DJSets";
import Pujari from "./pages/Pujari";
import GaneshIdol from "./pages/GaneshIdol";
import Photos from "./pages/Photos";
import Nimarganam from "./pages/Nimarganam";


// =====================================================
// APP
// =====================================================

function App() {

  return (

    <AuthProvider>

      <BrowserRouter>

        <Routes>


          {/* =================================================
              LOGIN
          ================================================= */}

          <Route
            path="/login"
            element={<Login />}
          />


          {/* =================================================
              REGISTER
          ================================================= */}

          <Route
            path="/register"
            element={<Register />}
          />


          {/* =================================================
              DASHBOARD
          ================================================= */}

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* =================================================
              COMMITTEE
          ================================================= */}

          <Route
            path="/committee"
            element={
              <ProtectedRoute>
                <Layout>
                  <Committee />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* =================================================
              VILLAGERS
          ================================================= */}

          <Route
            path="/villagers"
            element={
              <ProtectedRoute>
                <Layout>
                  <Villagers />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* =================================================
              DONATIONS
          ================================================= */}

          <Route
            path="/donations"
            element={
              <ProtectedRoute>
                <Layout>
                  <Donations />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* =================================================
              EXPENSES
          ================================================= */}

          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Layout>
                  <Expenses />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* =================================================
              DJ SETS
          ================================================= */}

          <Route
            path="/dj-sets"
            element={
              <ProtectedRoute>
                <Layout>
                  <DJSets />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* =================================================
              PUJARI
          ================================================= */}

          <Route
            path="/pujari"
            element={
              <ProtectedRoute>
                <Layout>
                  <Pujari />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* =================================================
              GANESH IDOLS
          ================================================= */}

          <Route
            path="/ganesh-idol"
            element={
              <ProtectedRoute>
                <Layout>
                  <GaneshIdol />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* =================================================
              PHOTOS
          ================================================= */}

          <Route
            path="/photos"
            element={
              <ProtectedRoute>
                <Layout>
                  <Photos />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* =================================================
              NIMARGANAM
          ================================================= */}

          <Route
            path="/nimarganam"
            element={
              <ProtectedRoute>
                <Layout>
                  <Nimarganam />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* =================================================
              VIDEOS
          ================================================= */}

          <Route
            path="/videos"
            element={
              <ProtectedRoute>
                <Layout>
                  <Nimarganam />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* =================================================
              ADMIN
          ================================================= */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <Admin />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* =================================================
              UNKNOWN ROUTE
          ================================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />


        </Routes>

      </BrowserRouter>

    </AuthProvider>

  );

}


export default App;