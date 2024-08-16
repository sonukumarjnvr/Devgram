import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import DeveloperScreen from './screens/DeveloperScreen';
import DeveloperDetailsScreen from './screens/DeveloperDetailsScreen';
import CreateProfileScreen from './screens/CreateProfileScreen';
import DashBoard from './screens/DashBoard';
import AddEducationScreen from './screens/AddEducationScreen';
import AddExperienceScreen from './screens/AddExperienceScreen';
import PostScreen from './screens/PostScreen';
import PostDetailsScreen from './screens/PostDetailsScreen';
import SignupScreen from './screens/SignupScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import Navbar from './components/Navbar';
import FollowPostScreen from './screens/FollowPostScreen';

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/users/signup" element={<SignupScreen />} />
          <Route path="/users/login" element={<LoginScreen />} />
          <Route path="/developers" element={<DeveloperScreen />} />
          <Route path="/profiles/dashboard" element={<DashBoard />} />
          <Route
            path="/developers/:developerId"
            element={<DeveloperDetailsScreen />}
          />
          <Route
            path="/profiles/create-profile"
            element={<CreateProfileScreen />}
          />
          <Route
            exact
            path="/profiles/edit-profile"
            element={<EditProfileScreen />}
          />
          <Route
            path="/profiles/add-education"
            element={<AddEducationScreen />}
          />
          <Route
            path="/profiles/add-experience"
            element={<AddExperienceScreen />}
          />
          <Route path="/posts/list" element={<PostScreen />} />
          <Route path="/posts/follow-post" element={<FollowPostScreen />} />
          <Route path="/posts/:postId" element={<PostDetailsScreen />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
