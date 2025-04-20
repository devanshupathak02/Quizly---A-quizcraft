import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { nanoid } from "nanoid";
import { useLocation } from "wouter";

import TabNavigation from "@/components/TabNavigation";
import QuestionCard from "@/components/QuestionCard";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { QuizQuestion, QuizOption } from "@shared/schema";

const quizFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  timeLimit: z.coerce.number().min(5, "Time limit must be at least 5 seconds").max(300, "Time limit cannot exceed 300 seconds"),
  passingScore: z.coerce.number().min(1, "Passing score must be at least 1%").max(100, "Passing score cannot exceed 100%"),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

export default function CreateQuiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([createDefaultQuestion()]);
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: "",
      description: "",
      timeLimit: 30,
      passingScore: 70,
    },
  });
  
  function createDefaultQuestion(): QuizQuestion {
    return {
      id: nanoid(),
      text: "",
      options: [
        { id: nanoid(), text: "", isCorrect: true },
        { id: nanoid(), text: "", isCorrect: false },
        { id: nanoid(), text: "", isCorrect: false },
        { id: nanoid(), text: "", isCorrect: false },
      ],
      explanation: "",
    };
  }
  
  const addQuestion = () => {
    setQuestions([...questions, createDefaultQuestion()]);
  };
  
  const updateQuestion = (index: number, updatedQuestion: QuizQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };
  
  const deleteQuestion = (index: number) => {
    // Don't allow deleting the last question
    if (questions.length <= 1) {
      toast({
        title: "Cannot delete question",
        description: "A quiz must have at least one question",
        variant: "destructive",
      });
      return;
    }
    
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };
  
  const validateQuestions = (): boolean => {
    let isValid = true;
    let errorMessage = "";
    
    if (questions.length === 0) {
      errorMessage = "Add at least one question to your quiz";
      isValid = false;
    } else {
      questions.forEach((question, index) => {
        if (!question.text.trim()) {
          errorMessage = `Question ${index + 1} is missing text`;
          isValid = false;
        }
        
        const filledOptions = question.options.filter(o => o.text.trim());
        if (filledOptions.length < 2) {
          errorMessage = `Question ${index + 1} needs at least 2 options`;
          isValid = false;
        }
        
        const hasCorrectOption = question.options.some(o => o.isCorrect);
        if (!hasCorrectOption) {
          errorMessage = `Question ${index + 1} needs a correct answer`;
          isValid = false;
        }
      });
    }
    
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
    
    return isValid;
  };
  
  const createQuizMutation = useMutation({
    mutationFn: async (data: QuizFormValues & { questions: QuizQuestion[] }) => {
      const res = await apiRequest("POST", "/api/quizzes", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quiz created successfully",
        description: "Your quiz is now ready to be taken",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes/me"] });
      navigate("/my-quizzes");
    },
    onError: (error) => {
      toast({
        title: "Failed to create quiz",
        description: error.message || "Please check your input and try again",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (values: QuizFormValues) => {
    // Validate questions
    if (!validateQuestions()) return;
    
    // Clean up empty options from questions
    const cleanedQuestions = questions.map(q => ({
      ...q,
      options: q.options.filter(o => o.text.trim()),
    }));
    
    // Create the quiz
    createQuizMutation.mutate({
      ...values,
      questions: cleanedQuestions,
    });
  };

  return (
    <>
      <TabNavigation />
      
      <Card className="bg-white rounded-lg shadow-sm mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a New Quiz</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Quiz Details */}
              <div className="mb-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="text-sm font-medium text-gray-700">Quiz Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a title for your quiz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this quiz is about" 
                          rows={3} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="timeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Time Limit (per question)</FormLabel>
                        <div className="flex items-center">
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30" 
                              min={5}
                              max={300}
                              {...field} 
                            />
                          </FormControl>
                          <span className="ml-2 text-sm text-gray-500">seconds</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="passingScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Passing Score</FormLabel>
                        <div className="flex items-center">
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="70"
                              min={1}
                              max={100}
                              {...field} 
                            />
                          </FormControl>
                          <span className="ml-2 text-sm text-gray-500">%</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Questions Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
                  <span className="text-sm text-gray-500">{questions.length} question{questions.length !== 1 ? 's' : ''} added</span>
                </div>
                
                {questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                    onUpdate={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                    onDelete={() => deleteQuestion(index)}
                  />
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center justify-center w-full py-2 px-4 border border-dashed rounded-lg text-sm font-medium text-gray-600 hover:text-primary hover:border-primary transition-colors duration-150"
                  onClick={addQuestion}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Question
                </Button>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button 
                  type="button" 
                  variant="ghost"
                  className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Save as Draft
                </Button>
                <Button 
                  type="submit"
                  disabled={createQuizMutation.isPending}
                  className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                >
                  {createQuizMutation.isPending ? "Creating..." : "Create Quiz"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
