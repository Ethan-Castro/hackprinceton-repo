'use client';

import * as React from 'react';
import { CheckCircle, XCircle, HelpCircle, Code, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ExerciseType = 'multiple-choice' | 'short-answer' | 'true-false' | 'coding' | 'discussion';
type Difficulty = 'easy' | 'medium' | 'hard';

interface ExerciseData {
  question: string;
  type: ExerciseType;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty?: Difficulty;
}

interface ExerciseSetProps {
  title?: string;
  exercises: ExerciseData[];
  className?: string;
}

const ExerciseCard: React.FC<{ exercise: ExerciseData; index: number }> = ({
  exercise,
  index,
}) => {
  const [selectedAnswer, setSelectedAnswer] = React.useState<string>('');
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [isCorrect, setIsCorrect] = React.useState(false);

  const handleSubmit = () => {
    if (exercise.correctAnswer) {
      const correct =
        selectedAnswer.toLowerCase().trim() ===
        exercise.correctAnswer.toLowerCase().trim();
      setIsCorrect(correct);
    }
    setShowFeedback(true);
  };

  const handleReset = () => {
    setSelectedAnswer('');
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const getDifficultyColor = (difficulty?: Difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 dark:text-green-400 bg-green-500/10';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10';
      case 'hard':
        return 'text-red-600 dark:text-red-400 bg-red-500/10';
      default:
        return 'text-muted-foreground bg-muted/50';
    }
  };

  const getTypeIcon = () => {
    switch (exercise.type) {
      case 'coding':
        return <Code className="h-4 w-4" />;
      case 'discussion':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="border rounded-lg bg-card shadow-sm overflow-hidden transition-all duration-200">
      {/* Exercise Header */}
      <div className="bg-muted/30 px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            {getTypeIcon()}
            <span>Question {index + 1}</span>
          </span>
        </div>
        {exercise.difficulty && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-1 rounded-full',
              getDifficultyColor(exercise.difficulty)
            )}
          >
            {exercise.difficulty.charAt(0).toUpperCase() +
              exercise.difficulty.slice(1)}
          </span>
        )}
      </div>

      {/* Exercise Content */}
      <div className="p-4 space-y-4">
        {/* Question */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {exercise.question}
          </ReactMarkdown>
        </div>

        {/* Answer Input */}
        {!showFeedback && (
          <div className="space-y-3">
            {exercise.type === 'multiple-choice' && exercise.options && (
              <div className="space-y-2">
                {exercise.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedAnswer(option)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-150',
                      selectedAnswer === option
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-border hover:border-indigo-300 hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex items-center justify-center w-6 h-6 rounded-full border-2 text-xs font-semibold',
                          selectedAnswer === option
                            ? 'border-indigo-500 bg-indigo-500 text-white'
                            : 'border-muted-foreground'
                        )}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {exercise.type === 'true-false' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedAnswer('true')}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-150',
                    selectedAnswer === 'true'
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-border hover:border-indigo-300 hover:bg-muted/50'
                  )}
                >
                  True
                </button>
                <button
                  onClick={() => setSelectedAnswer('false')}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all duration-150',
                    selectedAnswer === 'false'
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-border hover:border-indigo-300 hover:bg-muted/50'
                  )}
                >
                  False
                </button>
              </div>
            )}

            {(exercise.type === 'short-answer' ||
              exercise.type === 'coding' ||
              exercise.type === 'discussion') && (
              <Input
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder={
                  exercise.type === 'coding'
                    ? 'Enter your code...'
                    : exercise.type === 'discussion'
                      ? 'Share your thoughts...'
                      : 'Type your answer...'
                }
                className="w-full"
              />
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer.trim()}
                className="flex-1"
              >
                Submit Answer
              </Button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className="space-y-3">
            {exercise.correctAnswer && (
              <div
                className={cn(
                  'p-4 rounded-lg border-2 flex items-start gap-3',
                  isCorrect
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-red-500 bg-red-500/10'
                )}
              >
                {isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={cn(
                      'font-semibold mb-1',
                      isCorrect
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    )}
                  >
                    {isCorrect ? 'Correct!' : 'Not quite right'}
                  </p>
                  {!isCorrect && exercise.correctAnswer && (
                    <p className="text-sm text-muted-foreground">
                      Correct answer: <strong>{exercise.correctAnswer}</strong>
                    </p>
                  )}
                </div>
              </div>
            )}

            {exercise.explanation && (
              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="font-semibold mb-2 text-sm">Explanation:</p>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {exercise.explanation}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            <Button onClick={handleReset} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const Exercise: React.FC<ExerciseSetProps> = ({
  title = 'Practice Exercises',
  exercises,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border bg-card shadow-border-medium overflow-hidden transition-all duration-200',
        className
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2">
            <HelpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Test your understanding with {exercises.length} exercise
          {exercises.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Exercises */}
      <div className="p-6 space-y-4">
        {exercises.map((exercise, index) => (
          <ExerciseCard key={index} exercise={exercise} index={index} />
        ))}
      </div>
    </div>
  );
};
