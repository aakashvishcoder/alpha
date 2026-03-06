import ProfilePage from "./components/ProfileForm";
import AuthPage from "./components/AuthPage";
import GraphingCalculator from "./components/GraphingCalculator";

export default function App() {
  return (
    <div className="App">
      <ProfileForm />
      <AuthPage />
      <GraphingCalculator />
    </div>
  );
};
