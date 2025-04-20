import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CreateQuiz from "./pages/CreateQuiz";
import MyQuizzes from "./pages/MyQuizzes";
import Analytics from "./pages/Analytics";
import TakeQuiz from "./pages/TakeQuiz";
import QuizResults from "./pages/QuizResults";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CreateQuiz} />
      <Route path="/create" component={CreateQuiz} />
      <Route path="/my-quizzes" component={MyQuizzes} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/take/:id" component={TakeQuiz} />
      <Route path="/results/:id" component={QuizResults} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Router />
            </div>
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
