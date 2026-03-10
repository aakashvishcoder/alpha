import { Routes, Route} from 'react-router-dom';
import ProfileForm from "./components/ProfileForm";
import AuthPage from "./components/AuthPage";
import GraphingCalculator from "./components/GraphingCalculator";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProfileForm />} />
      <Route path="/grapher" element={<GraphingCalculator />} />
    </Routes>
  );
};
