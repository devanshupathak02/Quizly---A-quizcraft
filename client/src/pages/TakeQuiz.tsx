import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Quiz, QuizQuestion, QuizAnswer } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Calendar, Clock, Clipboard } from "lucide-react";
import QuizQuestionComponent from "@/components/QuizQuestion";

export default function TakeQuiz() {
  const params = useParams<{ id: string }>();
  const quizId = parseInt(params.id);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Define a custom type that extends Quiz with properly typed questions field
  interface QuizData extends Omit<Quiz, 'questions'> {
    questions: QuizQuestion[];
  }
  
  const quizQuery = useQuery<QuizData>({
    queryKey: [`/api/quizzes/${quizId}`]
  });
  
  const quiz = quizQuery.data;
  const isLoading = quizQuery.isLoading;
  const isError = quizQuery.isError;
  
  // Handle error
  useEffect(() => {
    if (quizQuery.error) {
      toast({
        title: "Failed to load quiz",
        description: (quizQuery.error as Error).message,
        variant: "destructive"
      });
    }
  }, [quizQuery.error, toast]);
  
  // Reset answers when quiz changes
  useEffect(() => {
    if (quiz) {
      setAnswers([]);
      setCurrentQuestionIndex(0);
      setQuizStarted(false);
    }
  }, [quiz]);
  
  const submitQuizMutation = useMutation({
    mutationFn: async (data: { answers: QuizAnswer[] }) => {
      const res = await apiRequest("POST", `/api/quizzes/${quizId}/attempt`, data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-attempts/me"] });
      navigate(`/results/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to submit quiz",
        description: error.message || "There was an error submitting your answers",
        variant: "destructive"
      });
    }
  });
  
  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm p-6">
        <CardContent className="p-0">
          <div className="mb-6 animate-pulse">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded" />
        </CardContent>
      </Card>
    );
  }
  
  if (isError || !quiz) {
    return (
      <Card className="bg-white rounded-lg shadow-sm p-6">
        <CardContent className="p-0 text-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz not found</h3>
          <p className="text-gray-600 mb-6">The quiz you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate("/my-quizzes")}>
            Go to My Quizzes
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  const handleAnswer = (selectedOptionId: string, isCorrect: boolean) => {
    // Update or add the answer for this question
    const questionId = currentQuestion.id;
    
    // Check if we already have an answer for this question
    const existingAnswerIndex = answers.findIndex(a => a.questionId === questionId);
    
    if (existingAnswerIndex >= 0) {
      // Update existing answer
      const updatedAnswers = [...answers];
      updatedAnswers[existingAnswerIndex] = {
        questionId,
        selectedOptionId,
        correct: isCorrect
      };
      setAnswers(updatedAnswers);
    } else {
      // Add new answer
      setAnswers([
        ...answers,
        {
          questionId,
          selectedOptionId,
          correct: isCorrect
        }
      ]);
    }
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit quiz
      submitQuizMutation.mutate({ answers });
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleTimeUp = () => {
    // Auto submit the current answer if not answered
    const questionId = currentQuestion.id;
    if (!answers.some(a => a.questionId === questionId)) {
      // If time's up and no answer selected, mark as incorrect
      setAnswers([
        ...answers,
        {
          questionId,
          selectedOptionId: "",
          correct: false
        }
      ]);
    }
    
    // Move to next question or submit
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit quiz
      submitQuizMutation.mutate({ answers });
    }
  };
  
  const startQuiz = () => {
    setQuizStarted(true);
  };
  
  return (
    <Card className="bg-white rounded-lg shadow-sm">
      {!quizStarted ? (
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{quiz.title}</h2>
          <p className="text-gray-600 mb-6">{quiz.description}</p>
          
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-8">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-5 w-5 mr-1 text-gray-400" />
              Created: {format(new Date(quiz.createdAt), 'MMMM d, yyyy')}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-5 w-5 mr-1 text-gray-400" />
              {quiz.timeLimit} seconds per question
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clipboard className="h-5 w-5 mr-1 text-gray-400" />
              {quiz.questions.length} questions
            </div>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-8">
            <h3 className="text-indigo-800 font-medium mb-2">Quiz Instructions</h3>
            <ul className="list-disc list-inside text-sm text-indigo-700 space-y-1">
              <li>You will have {quiz.timeLimit} seconds to answer each question</li>
              <li>If time runs out, the question will be marked as incorrect</li>
              <li>You can navigate between questions using the previous/next buttons</li>
              <li>Your score will be calculated once you complete all questions</li>
              <li>You need {quiz.passingScore}% or higher to pass the quiz</li>
            </ul>
          </div>
          
          <div className="text-center">
            <Button
              onClick={startQuiz}
              className="bg-primary hover:bg-indigo-700 text-white px-8 py-2 rounded-md text-sm font-medium transition-colors duration-150"
            >
              Start Quiz
            </Button>
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{quiz.title}</h3>
            <p className="text-gray-600 mb-4">{quiz.description}</p>
          </div>
          
          <div className="p-6">
            <QuizQuestionComponent
              question={currentQuestion}
              currentIndex={currentQuestionIndex}
              totalQuestions={quiz.questions.length}
              timeLimit={quiz.timeLimit}
              onAnswer={handleAnswer}
              onTimeUp={handleTimeUp}
              isPrevious={currentQuestionIndex > 0}
              isNext={currentQuestionIndex < quiz.questions.length - 1}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
