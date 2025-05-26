import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppContext } from "./contexts/AppContext";
import Auth from "./layouts/Auth";
import Home from "./views/Home";
import Register from "./views/Register";
import Login from "./views/Login";
import App from "./App";
import Dashboard from "./views/Dashboard";
import SendVerifyEmail from "./views/SendVerifyEmail";
import VerifyEmail from "./views/VerifyEmail";

export const AppRoutes = () => {
  return (
    <AppContext.Provider value={{}}>
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<Auth element={<Home />} />} />
          <Route
            path="/auth/register"
            element={<Auth element={<Register />} />}
          />
          <Route path="/auth/login" element={<Auth element={<Login />} />} />
          <Route path={"/verify-email"} element={<VerifyEmail />} />
          <Route path={"/"} element={<App />}>
            <Route path={"/dashboard"} element={<Dashboard />} />
            <Route path={"/send-verify-email"} element={<SendVerifyEmail />} />
          </Route>

          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
};
