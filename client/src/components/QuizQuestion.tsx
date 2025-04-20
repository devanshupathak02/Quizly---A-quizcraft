import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Timer from "./Timer";
import QuestionProgress from "./QuestionProgress";
import { QuizQuestion as QuizQuestionType, QuizOption } from "@shared/schema";

interface QuizQuestionProps {
  question: QuizQuestionType;
  currentIndex: number;
  totalQuestions: number;
  timeLimit: number;
  onAnswer: (selectedOptionId: string, isCorrect: boolean) => void;
  onTimeUp: () => void;
  isPrevious: boolean;
  isNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export default function QuizQuestion({
  question,
  currentIndex,
  totalQuestions,
  timeLimit,
  onAnswer,
  onTimeUp,
  isPrevious,
  isNext,
  onPrevious,
  onNext
}: QuizQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Reset selected option when the question changes
  useEffect(() => {
    setSelectedOption(null);
  }, [question.id]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    const isCorrect = !!question.options.find(
      (option) => option.id === optionId && option.isCorrect
    );
    onAnswer(optionId, isCorrect);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <QuestionProgress currentIndex={currentIndex} totalQuestions={totalQuestions} />
        <Timer seconds={timeLimit} onTimeUp={onTimeUp} />
      </div>
      
      <h4 className="text-lg font-medium text-gray-900 mb-5">{question.text}</h4>
      
      <RadioGroup
        value={selectedOption || ""}
        onValueChange={handleOptionSelect}
        className="space-y-3 mb-8"
      >
        {question.options.map((option: QuizOption) => (
          <Label
            key={option.id}
            htmlFor={option.id}
            className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150"
          >
            <RadioGroupItem id={option.id} value={option.id} className="h-4 w-4" />
            <span className="ml-3 font-medium text-gray-700">{option.text}</span>
          </Label>
        ))}
      </RadioGroup>
      
      <div className="flex justify-between">
        <Button
          variant="ghost"
          disabled={!isPrevious}
          onClick={onPrevious}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          Previous
        </Button>
        <Button
          onClick={onNext}
          className="bg-primary hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-150"
        >
          {currentIndex === totalQuestions - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
