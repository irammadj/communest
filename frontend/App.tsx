import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProviders } from './context/UserContext';
import Chatbot from './components/Chatbot';
import NewUserGuide from './components/NewUserGuide';

import Home from './pages/Home';
import Explore from './pages/Explore';
import MyEstate from './pages/MyEstate';
import About from './pages/About';
import ListYourEstate from './pages/ListYourEstate';
import Admin from './pages/Admin';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import RentalApplication from './pages/RentalApplication';

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/:estateId/apply/:houseId" element={<RentalApplication />} />
          <Route path="/my-estate" element={<MyEstate />} />
          <Route path="/about" element={<About />} />
          <Route path="/list-your-estate" element={<ListYourEstate />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Chatbot />
        <NewUserGuide />
      </AppProviders>
    </BrowserRouter>
  );
}
