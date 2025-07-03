import { Route, Routes } from "react-router-dom";
import BoardListPage from "./pages/BoardListPage";
import BoardDetailPage from "./pages/BoardDetailPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<BoardListPage />} />
        <Route path="/board/:id" element={<BoardDetailPage />} />
      </Routes>
    </>
  );
}

export default App;
