import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';

const features = [
  {
    path: '/studio/generator',
    icon: 'sparkles' as const,
    title: 'AI Outfit Generator',
    description: 'Describe an outfit, and let AI bring it to life as a photorealistic image.',
    gradient: 'from-pink-500 to-yellow-500',
    state: null,
  },
  {
    path: '/mixer',
    icon: 'mixer' as const,
    title: 'Mix & Match',
    description: 'Get AI-powered outfit suggestions from your own virtual wardrobe.',
    gradient: 'from-blue-500 to-indigo-500',
    state: { defaultMode: 'ai' },
  },
  {
    path: '/try-on',
    icon: 'wand-sparkles' as const,
    title: 'Look Fusion',
    description: 'Virtually try on clothes from your wardrobe using your camera.',
    gradient: 'from-purple-500 to-pink-500',
    state: null,
  },
  {
    path: '/studio/palette',
    icon: 'palette' as const,
    title: 'Palette Stylist',
    description: 'Upload an image and get a matching outfit from your closet.',
    gradient: 'from-green-400 to-blue-500',
    state: null,
  },
  {
    path: '/studio/trends',
    icon: 'trending-up' as const,
    title: 'Trend Spotter',
    description: 'Discover the latest fashion trends from across the web, powered by AI.',
    gradient: 'from-red-500 to-orange-500',
    state: null,
  },
  {
      path: '/mixer',
      state: { defaultMode: 'complete'},
      icon: 'puzzle-piece' as const,
      title: 'Complete the Look',
      description: 'Start with one piece and let AI build the perfect outfit around it.',
      gradient: 'from-teal-400 to-cyan-600'
  }
];

const StyleStudioPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-primary flex items-center justify-center gap-3">
              <Icon icon="brush" className="w-8 h-8"/>
              Style Studio
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Your creative hub for all things fashion.
            </p>
        </header>
        
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
                <Link 
                    key={index} 
                    to={feature.path} 
                    state={feature.state}
                    className={`block p-6 rounded-2xl shadow-lg text-white transition-transform transform hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-br ${feature.gradient}`}
                >
                    <div className="flex items-center gap-4 mb-2">
                        <Icon icon={feature.icon} className="w-8 h-8" />
                        <h2 className="text-2xl font-bold">{feature.title}</h2>
                    </div>
                    <p className="opacity-90">{feature.description}</p>
                </Link>
            ))}
        </main>
      </div>
    </div>
  );
};

export default StyleStudioPage;