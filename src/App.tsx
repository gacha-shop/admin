import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthStateProvider } from './providers/AuthStateProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MenuProtectedRoute } from './components/auth/MenuProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { NotFound } from './pages/NotFound';
import { AdminApprovals } from './pages/AdminApprovals';

// Gacha Shop
import Shops from './pages/Shops';
import Tags from './pages/Tags';
import ShopReviews from './pages/ShopReviews';

// Instagram
import InstagramHashtags from './pages/InstagramHashtags';
import InstagramFeeds from './pages/InstagramFeeds';

// Animation
import AnimationCharacters from './pages/AnimationCharacters';

// Admin
import AdminUsers from './pages/AdminUsers';
import AdminPermissions from './pages/AdminPermissions';
import MenuManagement from './pages/MenuManagement';

// Community
import CommunityPosts from './pages/CommunityPosts';

// Owner
import OwnerDashboard from './pages/OwnerDashboard';
import { OwnerStores } from './pages/owner/OwnerStores';

// Test
import TestEdgeFunctions from './pages/TestEdgeFunctions';

function App() {
  return (
    <BrowserRouter>
      <AuthStateProvider>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/404' element={<NotFound />} />
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<MainLayout />}>
              <Route index element={<Dashboard />} />

              {/* Products - Legacy */}

              {/* Gacha Shop */}
              <Route
                path='shops'
                element={
                  <MenuProtectedRoute>
                    <Shops />
                  </MenuProtectedRoute>
                }
              />
              <Route
                path='shops/tags'
                element={
                  <MenuProtectedRoute>
                    <Tags />
                  </MenuProtectedRoute>
                }
              />
              <Route
                path='shops/reviews'
                element={
                  <MenuProtectedRoute>
                    <ShopReviews />
                  </MenuProtectedRoute>
                }
              />

              {/* Instagram */}
              <Route
                path='instagram/hashtags'
                element={
                  <MenuProtectedRoute>
                    <InstagramHashtags />
                  </MenuProtectedRoute>
                }
              />
              <Route
                path='instagram/feeds'
                element={
                  <MenuProtectedRoute>
                    <InstagramFeeds />
                  </MenuProtectedRoute>
                }
              />

              {/* Animation */}
              <Route
                path='animation/characters'
                element={
                  <MenuProtectedRoute>
                    <AnimationCharacters />
                  </MenuProtectedRoute>
                }
              />

              {/* Admin */}
              <Route
                path='admin/users'
                element={
                  <MenuProtectedRoute>
                    <AdminUsers />
                  </MenuProtectedRoute>
                }
              />
              <Route
                path='admin/permissions'
                element={
                  <MenuProtectedRoute>
                    <AdminPermissions />
                  </MenuProtectedRoute>
                }
              />
              <Route
                path='admin/menus'
                element={
                  <MenuProtectedRoute>
                    <MenuManagement />
                  </MenuProtectedRoute>
                }
              />
              <Route
                path='admin-approvals'
                element={
                  <MenuProtectedRoute>
                    <AdminApprovals />
                  </MenuProtectedRoute>
                }
              />

              {/* User */}
              <Route
                path='users'
                element={
                  <MenuProtectedRoute>
                    <Users />
                  </MenuProtectedRoute>
                }
              />

              {/* Community */}
              <Route
                path='community/posts'
                element={
                  <MenuProtectedRoute>
                    <CommunityPosts />
                  </MenuProtectedRoute>
                }
              />

              {/* Owner */}
              <Route
                path='owner/dashboard'
                element={
                  <MenuProtectedRoute>
                    <OwnerDashboard />
                  </MenuProtectedRoute>
                }
              />
              <Route
                path='owner/store'
                element={
                  <MenuProtectedRoute>
                    <OwnerStores />
                  </MenuProtectedRoute>
                }
              />

              {/* Test */}
              <Route
                path='test/edge-functions'
                element={
                  <MenuProtectedRoute>
                    <TestEdgeFunctions />
                  </MenuProtectedRoute>
                }
              />

              {/* Settings */}
              <Route
                path='settings'
                element={
                  <MenuProtectedRoute>
                    <Settings />
                  </MenuProtectedRoute>
                }
              />
            </Route>
          </Route>

          {/* Catch all - 404 */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </AuthStateProvider>
    </BrowserRouter>
  );
}

export default App;
