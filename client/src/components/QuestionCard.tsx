import { useState } from "react";
import { ChevronDown, X, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { QuizOption, QuizQuestion } from "@shared/schema";
import { nanoid } from "nanoid";

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  onUpdate: (question: QuizQuestion) => void;
  onDelete: () => void;
}

export default function QuestionCard({ question, index, onUpdate, onDelete }: QuestionCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  const updateQuestion = (field: keyof QuizQuestion, value: any) => {
    onUpdate({
      ...question,
      [field]: value,
    });
  };

  const updateOptionText = (optionId: string, text: string) => {
    const updatedOptions = question.options.map(option =>
      option.id === optionId ? { ...option, text } : option
    );
    updateQuestion('options', updatedOptions);
  };

  const updateCorrectOption = (optionId: string) => {
    const updatedOptions = question.options.map(option =>
      ({ ...option, isCorrect: option.id === optionId })
    );
    updateQuestion('options', updatedOptions);
  };

  const addOption = () => {
    const newOption: QuizOption = {
      id: nanoid(),
      text: "",
      isCorrect: false
    };
    updateQuestion('options', [...question.options, newOption]);
  };

  const removeOption = (optionId: string) => {
    // Ensure we keep at least 2 options
    if (question.options.length <= 2) {
      return;
    }
    
    // If we're removing the correct option, make the first remaining option correct
    const isRemovingCorrect = question.options.find(o => o.id === optionId)?.isCorrect;
    
    let updatedOptions = question.options.filter(option => option.id !== optionId);
    
    if (isRemovingCorrect && updatedOptions.length > 0) {
      updatedOptions = updatedOptions.map((option, idx) => 
        idx === 0 ? { ...option, isCorrect: true } : option
      );
    }
    
    updateQuestion('options', updatedOptions);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border border-gray-200 rounded-lg mb-6"
    >
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <h4 className="font-medium">Question {index + 1}</h4>
        <div className="flex space-x-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </Button>
          </CollapsibleTrigger>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
      </div>
      
      <CollapsibleContent>
        <div className="p-4">
          <div className="mb-4">
            <Label htmlFor={`question-text-${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">
              Question Text
            </Label>
            <Input
              id={`question-text-${question.id}`}
              value={question.text}
              onChange={(e) => updateQuestion('text', e.target.value)}
              placeholder="Enter your question here"
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Answer Options
            </Label>
            
            <RadioGroup
              value={question.options.find(o => o.isCorrect)?.id || ""}
              onValueChange={updateCorrectOption}
              className="space-y-2"
            >
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center">
                  <RadioGroupItem
                    id={`option-${option.id}`}
                    value={option.id}
                    className="h-4 w-4"
                  />
                  <Input
                    className="ml-2 flex-grow"
                    value={option.text}
                    onChange={(e) => updateOptionText(option.id, e.target.value)}
                    placeholder="Enter an option"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-8 w-8 text-gray-400 hover:text-gray-600"
                    onClick={() => removeOption(option.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </RadioGroup>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 text-sm text-primary hover:text-indigo-700"
              onClick={addOption}
            >
              <Plus className="h-5 w-5 mr-1" />
              Add Another Option
            </Button>
          </div>
          
          <div>
            <Label htmlFor={`explanation-${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">
              Explanation (Optional)
            </Label>
            <Textarea
              id={`explanation-${question.id}`}
              rows={2}
              value={question.explanation || ""}
              onChange={(e) => updateQuestion('explanation', e.target.value)}
              placeholder="Provide an explanation for the correct answer"
              className="w-full"
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
