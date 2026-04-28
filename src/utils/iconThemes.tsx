import React from 'react';
import { Text } from 'react-native';
import { Smile, Coffee, Frown, Sparkles, Moon, Heart, CloudLightning, Flame, Zap, Lightbulb } from 'lucide-react-native';
import { Mood } from '../types';

export type IconThemeId = 'emoji' | 'lucide';

export interface ThemeConfig {
  id: IconThemeId;
  name: string;
  description: string;
}

export const THEMES: ThemeConfig[] = [
  { id: 'emoji', name: 'Emoji 3D', description: 'Expressive and colorful 3D-style emojis.' },
  { id: 'lucide', name: 'Plain Minimal', description: 'Clean, simple, and monochrome outline icons.' },
];

export const getThemeIcon = (theme: string, mood: Mood, size: number = 24, color: string = '#4B5563'): React.ReactNode => {
  if (theme === 'lucide') {
    switch (mood) {
      case 'Happy': return <Smile size={size} color={color} />;
      case 'Calm': return <Coffee size={size} color={color} />;
      case 'Sad': return <Frown size={size} color={color} />;
      case 'Excited': return <Sparkles size={size} color={color} />;
      case 'Tired': return <Moon size={size} color={color} />;
      case 'Grateful': return <Heart size={size} color={color} />;
      case 'Anxious': return <CloudLightning size={size} color={color} />;
      case 'Angry': return <Flame size={size} color={color} />;
      case 'Productive': return <Zap size={size} color={color} />;
      case 'Inspired': return <Lightbulb size={size} color={color} />;
      default: return <Smile size={size} color={color} />;
    }
  }

  // Default to 'emoji'
  let emojiChar = '😐';
  switch (mood) {
    case 'Happy': emojiChar = '😊'; break;
    case 'Calm': emojiChar = '😌'; break;
    case 'Sad': emojiChar = '😢'; break;
    case 'Excited': emojiChar = '🤩'; break;
    case 'Tired': emojiChar = '😴'; break;
    case 'Grateful': emojiChar = '🙏'; break;
    case 'Anxious': emojiChar = '😰'; break;
    case 'Angry': emojiChar = '😡'; break;
    case 'Productive': emojiChar = '🔥'; break;
    case 'Inspired': emojiChar = '💡'; break;
  }
  
  return <Text style={{ fontSize: size }}>{emojiChar}</Text>;
};
