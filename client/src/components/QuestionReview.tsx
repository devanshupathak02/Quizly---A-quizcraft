import { Check, X } from "lucide-react";
import { QuizQuestion, QuizAnswer } from "@shared/schema";

interface QuestionReviewProps {
  question: QuizQuestion;
  answer: QuizAnswer | undefined;
}

export default function QuestionReview({ question, answer }: QuestionReviewProps) {
  // If no answer was selected
  if (!answer) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-600">
              <X className="h-5 w-5" />
            </span>
          </div>
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-1">{question.text}</h5>
            <p className="text-sm text-gray-600 mb-1">Your answer: <span className="font-medium text-red-600">No answer</span></p>
            <p className="text-sm text-gray-600">Correct answer: <span className="font-medium">
              {question.options.find(o => o.isCorrect)?.text}
            </span></p>
          </div>
        </div>
      </div>
    );
  }

  const selectedOption = question.options.find(o => o.id === answer.selectedOptionId);
  const correctOption = question.options.find(o => o.isCorrect);

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {answer.correct ? (
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600">
              <Check className="h-5 w-5" />
            </span>
          ) : (
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-600">
              <X className="h-5 w-5" />
            </span>
          )}
        </div>
        <div>
          <h5 className="text-sm font-medium text-gray-900 mb-1">{question.text}</h5>
          <p className="text-sm text-gray-600 mb-1">
            Your answer: <span className={`font-medium ${answer.correct ? 'text-green-600' : 'text-red-600'}`}>
              {selectedOption?.text || "Unknown option"}
            </span>
          </p>
          {!answer.correct && (
            <p className="text-sm text-gray-600">
              Correct answer: <span className="font-medium">{correctOption?.text}</span>
            </p>
          )}
          {question.explanation && (
            <p className="text-sm text-gray-500 mt-2 italic">
              {question.explanation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
