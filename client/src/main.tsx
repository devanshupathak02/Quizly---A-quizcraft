import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.title = "QuizCraft - Create and Take Interactive Quizzes";

createRoot(document.getElementById("root")!).render(<App />);
