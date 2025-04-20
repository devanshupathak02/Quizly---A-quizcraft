import { cn } from "@/lib/utils";

interface QuestionProgressProps {
  currentIndex: number;
  totalQuestions: number;
}

export default function QuestionProgress({ currentIndex, totalQuestions }: QuestionProgressProps) {
  return (
    <div className="flex items-center">
      <span className="text-sm font-medium text-gray-700 mr-3">
        Question {currentIndex + 1} of {totalQuestions}
      </span>
      <div className="flex space-x-1">
        {Array.from({ length: totalQuestions }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "w-2 h-2 rounded-full",
              idx === currentIndex ? "bg-primary" : "bg-gray-200"
            )}
          />
        ))}
      </div>
    </div>
  );
}
