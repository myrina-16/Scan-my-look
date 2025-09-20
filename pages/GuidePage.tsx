
import React, { useEffect, useState } from 'react';
import { getOccasionGuide } from '../services/geminiService';
import { OccasionGuide } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { Icon } from '../components/Icon';

const GuidePage: React.FC = () => {
  const [guide, setGuide] = useState<OccasionGuide | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const data = await getOccasionGuide();
        setGuide(data);
      } catch (error) {
        console.error("Failed to load occasion guide", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuide();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-brand-primary mb-6 flex items-center gap-3">
          <Icon icon="book" className="w-8 h-8"/>
          AI-Powered Occasion Guide
        </h1>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner text="Loading Fashion Wisdom..." />
          </div>
        ) : !guide ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <p className="text-slate-500 text-lg">Could not load the guide at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(guide).map((section, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-brand-secondary mb-2">{section.title}</h2>
                <p className="text-slate-600 mb-4">{section.description}</p>
                <ul className="space-y-2">
                  {section.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-3 text-slate-700">
                      <span className="text-brand-accent font-bold mt-1 text-lg">&rarr;</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidePage;
