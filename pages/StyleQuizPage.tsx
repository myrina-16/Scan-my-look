import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { QUIZ_QUESTIONS } from '../data/quiz-data';
import { Icon } from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';

const StyleQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { isGeneratingProfile, generateAndSetStyleProfile } = useAppContext();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;

  const handleAnswerSelect = (answerValue: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerValue;
    setAnswers(newAnswers);

    // Automatically move to the next question
    setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    }, 300);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      navigate('/library');
    }
  };
  
  const handleSubmit = async () => {
    setError(null);
    try {
        await generateAndSetStyleProfile(answers);
        navigate('/profile');
    } catch(e: any) {
        setError(e.message || "Something went wrong. Please try again.");
    }
  };

  if (isGeneratingProfile) {
    return (
      <div className="min-h-screen bg-brand-primary flex flex-col items-center justify-center text-white p-4 text-center">
        <LoadingSpinner text="Analyzing your style DNA..." />
        <p className="mt-4 text-slate-300">This might take a moment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-4">
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div
            className="bg-brand-accent h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-2xl w-full">
            {error && (
                <div className="bg-red-100 border-l-4 border-feedback-red text-red-700 p-4 rounded-lg mb-6">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
            
            {currentQuestionIndex < totalQuestions ? (
              <div className="animate-fadeIn">
                <p className="text-sm font-bold text-brand-secondary">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-brand-primary mt-2 mb-8">{currentQuestion.question}</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentQuestion.answers.map((answer, index) => {
                    const isSelected = answers[currentQuestionIndex] === answer.value;
                    return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(answer.value)}
                          className={`block p-6 rounded-lg border-2 text-left transition-all duration-200 transform hover:scale-105 ${
                            isSelected
                              ? 'bg-brand-accent border-brand-accent text-white shadow-lg'
                              : 'bg-white border-slate-200 hover:border-brand-secondary'
                          }`}
                        >
                          <p className="font-semibold text-lg">{answer.text}</p>
                        </button>
                    )
                  })}
                </div>
              </div>
            ) : (
                <div className="animate-fadeIn">
                    <Icon icon="sparkles" className="w-16 h-16 text-brand-accent mx-auto mb-4"/>
                    <h1 className="text-3xl font-bold text-brand-primary">You're All Set!</h1>
                    <p className="text-slate-600 mt-2 mb-8">Ready to discover your unique style profile?</p>
                    <button onClick={handleSubmit} className="bg-brand-accent text-white font-bold py-4 px-10 rounded-lg shadow-lg hover:bg-opacity-90 transition-transform hover:-translate-y-1">
                        Generate My Style Profile
                    </button>
              </div>
            )}
        </div>
      </main>
      
      <footer className="p-4 flex justify-center">
          <button onClick={handleBack} className="flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-accent">
            <Icon icon="arrow-left" className="w-5 h-5" />
            <span>{currentQuestionIndex > 0 ? 'Back' : 'Cancel'}</span>
          </button>
      </footer>
    </div>
  );
};

export default StyleQuizPage;
