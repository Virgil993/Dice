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
import ForgotPassword from "./views/ForgotPassword";
import ResetPassword from "./views/ResetPassword";
import Profile from "./views/Profile";
import EnableTotp from "./views/EnableTotp";
import TestTotp from "./views/TestTotp";

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
          <Route path={"/forgot-password"} element={<ForgotPassword />} />
          <Route path={"/reset-password"} element={<ResetPassword />} />
          <Route path={"/"} element={<App />}>
            <Route path={"/dashboard"} element={<Dashboard />} />
            <Route path={"/send-verify-email"} element={<SendVerifyEmail />} />
            <Route path={"/profile"} element={<Profile />} />
            <Route path={"/enable-totp"} element={<EnableTotp />} />
            <Route path={"/test-totp"} element={<TestTotp />} />
          </Route>

          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
};
