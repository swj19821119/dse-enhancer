'use client';

import { useState } from 'react';

interface Word {
  word: string;
  phonetic?: string;
  definition: string;
  example?: string;
}

const mockWords: Word[] = [
  {
    word: 'analyse',
    phonetic: '/ˈænəlaɪz/',
    definition: 'v. 分析',
    example: 'The data can be analysed to find patterns.',
  },
  {
    word: 'evaluate',
    phonetic: '/ɪˈvæljueɪt/',
    definition: 'v. 评估',
    example: 'We need to evaluate the results.',
  },
];

export default function VocabularyPage() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [knownWords, setKnownWords] = useState<string[]>([]);

  const currentWord = mockWords[currentWordIndex];

  const handleKnown = () => {
    setKnownWords([...knownWords, currentWord.word]);
    nextWord();
  };

  const handleUnknown = () => {
    nextWord();
  };

  const nextWord = () => {
    if (currentWordIndex < mockWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">词汇闯关</h1>
            <div className="text-gray-600">
              进度: {currentWordIndex + 1} / {mockWords.length}
            </div>
          </div>

          <div className="text-center py-8">
            <h2 className="text-4xl font-bold mb-2">{currentWord.word}</h2>
            {currentWord.phonetic && (
              <p className="text-xl text-gray-500 mb-4">{currentWord.phonetic}</p>
            )}
            <p className="text-2xl font-medium mb-6">{currentWord.definition}</p>
            {currentWord.example && (
              <p className="text-lg text-gray-600 italic">"{currentWord.example}"</p>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleUnknown}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg text-lg transition-colors"
            >
              不认识
            </button>
            <button 
              onClick={handleKnown}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg text-lg transition-colors"
            >
              认识
            </button>
          </div>

          {knownWords.length > 0 && (
            <div className="mt-6">
              <p className="text-gray-600">
                已认识: {knownWords.length} / {mockWords.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
