import React, { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, Award, X } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface QuizData {
  course_id: string;
  course_title: string;
  skills: string[];
  questions: QuizQuestion[];
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizData | null;
  onPassed?: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  quiz,
  onPassed,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  if (!isOpen || !quiz) return null;

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_index) {
        score += 1;
      }
    });
    return score;
  };

  const allAnswered = quiz.questions.length > 0 && Object.keys(selectedAnswers).length === quiz.questions.length;
  const score = calculateScore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-border shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-text-subtle hover:text-text hover:bg-gray-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-light">
          <div className="w-10 h-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-primary uppercase tracking-wider">
              Diagnostic Assessment
            </div>
            <h3 className="text-lg font-bold text-text mt-0.5">{quiz.course_title}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {quiz.skills.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-semibold text-text-muted">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {quiz.questions.map((q, qIdx) => {
            const chosen = selectedAnswers[qIdx];
            const isCorrect = chosen === q.correct_index;

            return (
              <div key={qIdx} className="space-y-3 p-4 rounded-xl border border-border-light bg-gray-50/50">
                <div className="text-xs font-bold text-text flex items-start gap-2">
                  <span className="text-primary font-mono shrink-0">Q{qIdx + 1}.</span>
                  <span>{q.question}</span>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = chosen === optIdx;
                    let optionClasses = "border border-border bg-white text-text hover:border-primary/50";

                    if (showResults) {
                      if (optIdx === q.correct_index) {
                        optionClasses = "border-accent-green bg-accent-greenSubtle/40 text-accent-green font-bold";
                      } else if (isSelected && !isCorrect) {
                        optionClasses = "border-accent-rose bg-accent-roseSubtle/40 text-accent-rose";
                      } else {
                        optionClasses = "border-border-light bg-gray-50 opacity-60 text-text-muted";
                      }
                    } else if (isSelected) {
                      optionClasses = "border-primary bg-primary-subtle/20 text-primary font-bold";
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelect(qIdx, optIdx)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${optionClasses}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {showResults && optIdx === q.correct_index && (
                          <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0" />
                        )}
                        {showResults && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-accent-rose shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Grounded Explanation if Results Shown */}
                {showResults && (
                  <div className="p-3 bg-white rounded-lg border border-border-light text-[11px] text-text-muted leading-relaxed">
                    <span className="font-bold text-text block mb-0.5">Rationale:</span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions & Score */}
        <div className="mt-6 pt-4 border-t border-border-light flex items-center justify-between">
          <div>
            {showResults ? (
              <div className="flex items-center gap-2">
                <Award className={`w-5 h-5 ${score >= 2 ? "text-accent-green" : "text-accent-amber"}`} />
                <span className="text-sm font-bold text-text">
                  Score: {score} / {quiz.questions.length} ({Math.round((score / quiz.questions.length) * 100)}%)
                </span>
              </div>
            ) : (
              <span className="text-xs text-text-muted">
                {Object.keys(selectedAnswers).length} of {quiz.questions.length} answered
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!showResults ? (
              <Button
                variant="primary"
                size="sm"
                disabled={!allAnswered}
                onClick={() => {
                  setShowResults(true);
                  if (onPassed) onPassed();
                }}
              >
                Submit Answers
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={onClose}>
                Done & Continue
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
