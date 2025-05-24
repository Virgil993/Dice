import { Outlet } from "react-router-dom";

function App() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* <Header /> */}
      {/* Render page content */}
      <Outlet />
      {/* <Footer /> */}
    </div>
  );
}

export default App;
