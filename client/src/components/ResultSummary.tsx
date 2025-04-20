import { CheckCircle, XCircle } from "lucide-react";

interface ResultSummaryProps {
  score: number;
  totalQuestions: number;
  passingScore: number;
}

export default function ResultSummary({ score, totalQuestions, passingScore }: ResultSummaryProps) {
  const correctAnswers = Math.round((score / 100) * totalQuestions);
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = score >= passingScore;

  return (
    <div className="text-center mb-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h3>
      <p className="text-gray-600">
        You scored {correctAnswers} out of {totalQuestions} questions correctly.
      </p>
      
      <div className="w-32 h-32 mx-auto my-6 relative">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path 
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
            fill="none" 
            stroke="#E5E7EB" 
            strokeWidth="3" 
            strokeDasharray="100, 100" 
          />
          <path 
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
            fill="none" 
            stroke="#4F46E5" 
            strokeWidth="3" 
            strokeDasharray={`${scorePercentage}, 100`} 
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-primary">
          {scorePercentage}%
        </div>
      </div>
      
      <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium">
        {passed ? (
          <div className="bg-green-50 text-green-700 rounded-full px-4 py-2 flex items-center">
            <CheckCircle className="h-5 w-5 mr-1" />
            Passed!
          </div>
        ) : (
          <div className="bg-red-50 text-red-700 rounded-full px-4 py-2 flex items-center">
            <XCircle className="h-5 w-5 mr-1" />
            Failed
          </div>
        )}
      </div>
    </div>
  );
}
