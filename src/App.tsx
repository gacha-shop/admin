import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthStateProvider } from "./providers/AuthStateProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { MainLayout } from "./components/layout/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { Users } from "./pages/Users";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { AdminApprovals } from "./pages/AdminApprovals";
import Tags from "./pages/Tags";

function App() {
  return (
    <BrowserRouter>
      <AuthStateProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="tags" element={<Tags />} />
              <Route path="users" element={<Users />} />
              <Route path="admin-approvals" element={<AdminApprovals />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </AuthStateProvider>
    </BrowserRouter>
  );
}

export default App;
