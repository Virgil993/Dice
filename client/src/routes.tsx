import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppContext } from "./contexts/AppContext";
import Auth from "./layouts/Auth";
import Home from "./views/Home";

export const AppRoutes = () => {
  return (
    <AppContext.Provider value={{}}>
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<Auth element={<Home />} />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
};
