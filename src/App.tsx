import { useLocation } from "wouter";
import { AppRoutes } from "./routes";
import { MainLayout } from "./components/layout";
import "./App.css";

function App() {
  const [location] = useLocation();

  // Login page doesn't use the main layout
  const isAuthPage = location === "/login";

  if (isAuthPage) {
    return <AppRoutes />;
  }

  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  );
}

export default App;
