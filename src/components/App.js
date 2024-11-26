import './../App.css';
import VideoChat from './VideoChat';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
          <Route path='videochat' index element={<Home />} />
          <Route path="videochat/videocall" element={<VideoChat/>} />
      </Routes>
    </BrowserRouter>
   </>
  );
}

export default App;
