import { Outlet } from "react-router-dom";
import Header from "./Header";
import ToastHost from "./ToastHost";

function RootLayout() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      <main className="container flex-grow-1 pb-5">
        <Outlet />
      </main>
      <ToastHost />
    </div>
  );
}

export default RootLayout;
