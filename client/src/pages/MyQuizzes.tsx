import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import TabNavigation from "@/components/TabNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Calendar, Clock, Eye, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  createdBy: number;
  questions: any[];
  createdAt: string;
}

export default function MyQuizzes() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [quizToDelete, setQuizToDelete] = useState<number | null>(null);

  const { data: quizzes, isLoading, isError } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes/me"],
    onError: (error: Error) => {
      toast({
        title: "Failed to load quizzes",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: number) => {
      const res = await apiRequest("DELETE", `/api/quizzes/${quizId}`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quiz deleted",
        description: "The quiz has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes/me"] });
      setQuizToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete quiz",
        description: error.message || "There was an error deleting the quiz",
        variant: "destructive"
      });
    }
  });

  const handleDeleteQuiz = (quizId: number) => {
    deleteQuizMutation.mutate(quizId);
  };

  const handleTakeQuiz = (quizId: number) => {
    navigate(`/take/${quizId}`);
  };

  return (
    <>
      <TabNavigation />
      
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Quizzes</h2>
        <Button 
          onClick={() => navigate("/create")}
          className="bg-primary hover:bg-indigo-700 text-white"
        >
          Create New Quiz
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="border border-gray-200">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between mt-4">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center py-10">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load quizzes</h3>
            <p className="text-gray-600 mb-4">There was a problem loading your quizzes.</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/quizzes/me"] })}>
              Try Again
            </Button>
          </div>
        </div>
      ) : quizzes && quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Created: {format(new Date(quiz.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{quiz.timeLimit} seconds per question</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <span>{quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-gray-500"
                    onClick={() => {}}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>

                  <AlertDialog open={quizToDelete === quiz.id} onOpenChange={(open) => !open && setQuizToDelete(null)}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500" 
                        onClick={() => setQuizToDelete(quiz.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the quiz "{quiz.title}" and all associated data.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => handleDeleteQuiz(quiz.id)}
                        >
                          {deleteQuizMutation.isPending && quizToDelete === quiz.id
                            ? "Deleting..."
                            : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <Button 
                  className="bg-primary hover:bg-indigo-700 text-white" 
                  size="sm"
                  onClick={() => handleTakeQuiz(quiz.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Take Quiz
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center py-10">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
            <p className="text-gray-600 mb-4">Create your first quiz to get started!</p>
            <Button 
              onClick={() => navigate("/create")}
              className="bg-primary hover:bg-indigo-700 text-white"
            >
              Create Quiz
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
