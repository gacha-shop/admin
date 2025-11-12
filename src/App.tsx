import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';

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

// User
import { Users } from './pages/Users';

// Community
import CommunityPosts from './pages/CommunityPosts';

// Owner
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerStores from './pages/OwnerStores';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<MainLayout />}>
          <Route index element={<Dashboard />} />

          {/* Gacha Shop */}
          <Route path='shops' element={<Shops />} />
          <Route path='shops/tags' element={<Tags />} />
          <Route path='shops/reviews' element={<ShopReviews />} />

          {/* Instagram */}
          <Route path='instagram/hashtags' element={<InstagramHashtags />} />
          <Route path='instagram/feeds' element={<InstagramFeeds />} />

          {/* Animation */}
          <Route path='animation/characters' element={<AnimationCharacters />} />

          {/* Admin */}
          <Route path='admin/users' element={<AdminUsers />} />
          <Route path='admin/permissions' element={<AdminPermissions />} />

          {/* User */}
          <Route path='users' element={<Users />} />

          {/* Community */}
          <Route path='community/posts' element={<CommunityPosts />} />

          {/* Owner */}
          <Route path='owner/dashboard' element={<OwnerDashboard />} />
          <Route path='owner/stores' element={<OwnerStores />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
