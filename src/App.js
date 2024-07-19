import './App.css';
import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Login } from "./components/login";
import { Home } from "./components/Home"
import { Register } from './components/Register';
import { AddGrabPost } from './components/grabPost';
import { AddFoodPost } from './components/foodPost';
import { AddSportPost } from './components/sportPost';
import { AddTutPost } from './components/tutorialPost';
import { ShowFood } from './components/FoodPage';
import { ShowGrab } from './components/GrabPage';
import { ShowSport } from './components/SportPage';
import { ShowGroup } from './components/GroupPage';
import { ChakraProvider } from '@chakra-ui/react';
import { Landing } from './components/landing';
import { CreateProfile } from './components/userProfile';
import { Guide } from './components/guide';
import { Chatsoverview} from './components/Chatsoverview';
import { ChatPage } from './components/ChatPage';
import { TermsOfService } from "./components/Terms"; 



function App() {
  const [currentForm, setCurrentForm] = useState('landing');

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  }

  return (
    <ChakraProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login onFormSwitch={toggleForm} />} />
        <Route path="/register" element={<Register onFormSwitch={toggleForm} />} />
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Landing />} />
        <Route path="/addpost" element={<AddGrabPost />} />
        <Route path="/addfoodpost" element={<AddFoodPost />} />
        <Route path="/addsportpost" element={<AddSportPost />} />
        <Route path="/addtutpost" element={<AddTutPost />} />
        <Route path="/showfood" element={<ShowFood />} />
        <Route path="/showgrab" element={<ShowGrab />} />
        <Route path="/showsport" element={<ShowSport />} />
        <Route path="/showgroup" element={<ShowGroup />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/createprofile" element={<CreateProfile />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/chatsoverview" element={<Chatsoverview />} />
        <Route path="/chatpage/:chatRoomId" element={<ChatPage />} />
        <Route path="/terms-of-service" element={<TermsOfService/>} />
      </Routes>
    </Router>
    </ChakraProvider>
  );
}

export default App;