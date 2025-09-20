import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'How would you describe your ideal weekend outfit?',
    answers: [
      { text: 'Comfortable & Chill', value: 'Comfortable, relaxed, and casual, like jeans and a cozy sweater.' },
      { text: 'Polished & Put-Together', value: 'Chic and sophisticated, like a tailored blazer and classic trousers.' },
      { text: 'Trendy & Bold', value: 'Experimental and eye-catching, featuring the latest trends and statement pieces.' },
      { text: 'Free-spirited & Artistic', value: 'Flowy and unique, with vintage elements, patterns, and natural fabrics.' },
    ],
  },
  {
    id: 2,
    question: 'Which color palette are you most drawn to?',
    answers: [
      { text: 'Neutral Tones', value: 'A palette of neutrals: beige, white, black, and gray.' },
      { text: 'Rich & Moody Hues', value: 'Deep, rich colors like burgundy, forest green, and navy.' },
      { text: 'Bright & Vibrant Shades', value: 'Bold and energetic colors like hot pink, electric blue, and sunny yellow.' },
      { text: 'Earthy & Warm Tones', value: 'Warm, earthy tones like terracotta, mustard, and olive green.' },
    ],
  },
  {
    id: 3,
    question: 'Pick a pattern you\'d love to wear:',
    answers: [
      { text: 'Classic Stripes', value: 'Timeless patterns like Breton stripes or simple pinstripes.' },
      { text: 'Animal Print', value: 'Bold patterns like leopard, snake, or zebra print.' },
      { text: 'Geometric Shapes', value: 'Modern and abstract geometric patterns.' },
      { text: 'Floral & Paisley', value: 'Romantic and vintage-inspired floral or paisley prints.' },
    ],
  },
  {
    id: 4,
    question: 'Your go-to accessory is...',
    answers: [
      { text: 'A delicate gold necklace', value: 'Minimalist and timeless accessories.' },
      { text: 'A statement handbag', value: 'A bold, designer, or trend-setting handbag.' },
      { text: 'Chunky, colorful jewelry', value: 'Playful and oversized jewelry that makes a statement.' },
      { text: 'A wide-brimmed hat or unique scarf', value: 'Artistic and functional accessories with a bohemian flair.' },
    ],
  },
  {
    id: 5,
    question: 'Which fashion era inspires you most?',
    answers: [
      { text: 'The 1950s & 60s', value: 'The classic elegance of the 1950s and 60s.' },
      { text: 'The 1980s & 90s', value: 'The bold, eclectic, and grunge styles of the 80s and 90s.' },
      { text: 'The Futuristic 2000s (Y2K)', value: 'The playful, metallic, and futuristic Y2K aesthetic.' },
      { text: 'The 1970s', value: 'The free-spirited, bohemian, and disco vibes of the 1970s.' },
    ],
  },
];
