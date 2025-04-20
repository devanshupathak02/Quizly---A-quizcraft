import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import ResultSummary from "@/components/ResultSummary";
import QuestionReview from "@/components/QuestionReview";
import { QuizAttempt, Quiz } from "@shared/schema";

export default function QuizResults() {
  const params = useParams<{ id: string }>();
  const attemptId = parseInt(params.id);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Define custom types with correct typing for jsonb fields
  interface QuizAttemptData extends Omit<QuizAttempt, 'answers'> {
    answers: QuizAnswer[];
  }
  
  interface QuizData extends Omit<Quiz, 'questions'> {
    questions: QuizQuestion[];
  }

  // First fetch the quiz attempt
  const attemptQuery = useQuery({
    queryKey: [`/api/quiz-attempts/me`]
  });
  
  // Type the data correctly and extract the specific attempt
  const attempts = attemptQuery.data as QuizAttemptData[] | undefined;
  const attempt = attempts?.find(a => a.id === attemptId);
  const isLoadingAttempt = attemptQuery.isLoading;
  const isErrorAttempt = attemptQuery.isError;
  
  // Handle error for attempt query
  useEffect(() => {
    if (attemptQuery.error) {
      toast({
        title: "Failed to load quiz attempt",
        description: (attemptQuery.error as Error).message,
        variant: "destructive"
      });
    }
  }, [attemptQuery.error, toast]);
  
  // Then fetch the associated quiz if we have the attempt
  const quizQuery = useQuery({
    queryKey: attempt ? [`/api/quizzes/${attempt.quizId}`] : null,
    enabled: !!attempt
  });
  
  const quiz = quizQuery.data as QuizData | undefined;
  const isLoadingQuiz = quizQuery.isLoading;
  const isErrorQuiz = quizQuery.isError;
  
  // Handle error for quiz query
  useEffect(() => {
    if (quizQuery.error) {
      toast({
        title: "Failed to load quiz details",
        description: (quizQuery.error as Error).message,
        variant: "destructive"
      });
    }
  }, [quizQuery.error, toast]);
  
  // Reset page scroll position
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const isLoading = isLoadingAttempt || isLoadingQuiz;
  const isError = isErrorAttempt || isErrorQuiz;
  
  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm p-6">
        <CardContent className="p-0">
          <div className="text-center mb-6 animate-pulse">
            <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-4 w-1/2 mx-auto mb-6" />
            <div className="w-32 h-32 mx-auto my-6 rounded-full">
              <Skeleton className="h-full w-full rounded-full" />
            </div>
            <Skeleton className="h-6 w-24 mx-auto" />
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError || !attempt || !quiz) {
    return (
      <Card className="bg-white rounded-lg shadow-sm p-6">
        <CardContent className="p-0 text-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Results not found</h3>
          <p className="text-gray-600 mb-6">The quiz results you're looking for don't exist or you don't have permission to view them.</p>
          <Button onClick={() => navigate("/my-quizzes")}>
            Go to My Quizzes
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-6">
        <ResultSummary 
          score={attempt.score} 
          totalQuestions={quiz.questions.length}
          passingScore={quiz.passingScore}
        />
        
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Question Review</h4>
          
          <div className="space-y-4">
            {quiz.questions.map((question) => (
              <QuestionReview 
                key={question.id} 
                question={question}
                answer={attempt.answers.find(a => a.questionId === question.id)}
              />
            ))}
          </div>
        </div>
        
        <div className="mt-6 flex space-x-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(`/take/${quiz.id}`)}
          >
            Retake Quiz
          </Button>
          <Button
            className="bg-primary hover:bg-indigo-700 text-white"
            onClick={() => navigate("/my-quizzes")}
          >
            Return to My Quizzes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
