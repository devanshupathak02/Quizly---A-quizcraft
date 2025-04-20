import { useQuery } from "@tanstack/react-query";
import TabNavigation from "@/components/TabNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizAttempt {
  id: number;
  quizId: number;
  userId: number;
  score: number;
  passed: boolean;
  answers: any[];
  completedAt: string;
}

interface Quiz {
  id: number;
  title: string;
}

export default function Analytics() {
  const { data: quizzes, isLoading: isLoadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes/me"],
  });

  const { data: attempts, isLoading: isLoadingAttempts } = useQuery<QuizAttempt[]>({
    queryKey: ["/api/quiz-attempts/me"],
  });

  // Prepare data for charts
  const prepareScoreDistribution = () => {
    if (!attempts) return [];
    
    const scoreRanges = [
      { name: '0-20%', range: [0, 20], count: 0 },
      { name: '21-40%', range: [21, 40], count: 0 },
      { name: '41-60%', range: [41, 60], count: 0 },
      { name: '61-80%', range: [61, 80], count: 0 },
      { name: '81-100%', range: [81, 100], count: 0 },
    ];
    
    attempts.forEach(attempt => {
      const scoreRange = scoreRanges.find(
        range => attempt.score >= range.range[0] && attempt.score <= range.range[1]
      );
      if (scoreRange) scoreRange.count++;
    });
    
    return scoreRanges;
  };

  const preparePassFailData = () => {
    if (!attempts) return [];
    
    const passed = attempts.filter(a => a.passed).length;
    const failed = attempts.length - passed;
    
    return [
      { name: 'Passed', value: passed },
      { name: 'Failed', value: failed },
    ];
  };

  const getQuizTitle = (quizId: number) => {
    if (!quizzes) return `Quiz #${quizId}`;
    const quiz = quizzes.find(q => q.id === quizId);
    return quiz ? quiz.title : `Quiz #${quizId}`;
  };

  const prepareQuizPerformance = () => {
    if (!attempts || !quizzes) return [];
    
    const quizPerformance: Record<number, { attempts: number, avgScore: number }> = {};
    
    attempts.forEach(attempt => {
      if (!quizPerformance[attempt.quizId]) {
        quizPerformance[attempt.quizId] = { attempts: 0, avgScore: 0 };
      }
      
      quizPerformance[attempt.quizId].attempts++;
      quizPerformance[attempt.quizId].avgScore += attempt.score;
    });
    
    return Object.entries(quizPerformance).map(([quizId, data]) => ({
      name: getQuizTitle(parseInt(quizId)),
      avgScore: Math.round(data.avgScore / data.attempts),
      attempts: data.attempts,
    }));
  };

  const COLORS = ['#4F46E5', '#EF4444'];

  return (
    <>
      <TabNavigation />
      
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
      
      {(isLoadingQuizzes || isLoadingAttempts) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="border border-gray-200">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : attempts && attempts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Summary Card */}
          <Card className="border border-gray-200 col-span-full">
            <CardHeader>
              <CardTitle>Quiz Performance Summary</CardTitle>
              <CardDescription>Overview of your quiz taking performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-1">Total Attempts</p>
                  <p className="text-3xl font-bold text-primary">{attempts.length}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-primary">
                    {Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)}%
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-1">Passed</p>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
                    <p className="text-3xl font-bold text-green-500">
                      {attempts.filter(a => a.passed).length}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-1">Failed</p>
                  <div className="flex items-center justify-center">
                    <XCircle className="h-6 w-6 mr-2 text-red-500" />
                    <p className="text-3xl font-bold text-red-500">
                      {attempts.filter(a => !a.passed).length}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Distribution Chart */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
              <CardDescription>Distribution of your scores across all quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareScoreDistribution()}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Number of Attempts" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pass/Fail Ratio Chart */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle>Pass/Fail Ratio</CardTitle>
              <CardDescription>Success rate across all quiz attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={preparePassFailData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {preparePassFailData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Performance Chart */}
          <Card className="border border-gray-200 col-span-full">
            <CardHeader>
              <CardTitle>Quiz Performance</CardTitle>
              <CardDescription>Your average score per quiz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareQuizPerformance()}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgScore" name="Average Score (%)" fill="#4F46E5" />
                    <Bar dataKey="attempts" name="Number of Attempts" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex justify-center items-center py-10">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quiz attempts yet</h3>
            <p className="text-gray-600">Take some quizzes to see your analytics here!</p>
          </div>
        </div>
      )}
    </>
  );
}
