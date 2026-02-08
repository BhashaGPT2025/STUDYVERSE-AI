import React, { useState, useEffect } from 'react';
import { Landing } from './pages/Landing';
import { Setup } from './pages/Setup';
import { MapPage } from './pages/Map';
import { LessonPage } from './pages/Lesson';
import { getUser } from './services/db';

enum Page {
  LANDING,
  SETUP,
  MAP,
  LESSON
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LANDING);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user exists to skip landing/setup
    getUser().then(user => {
      if (user) {
        setCurrentPage(Page.MAP);
      }
    });
  }, []);

  const handleStart = () => setCurrentPage(Page.SETUP);
  const handleSetupComplete = () => setCurrentPage(Page.MAP);
  const handleLessonSelect = (id: string) => {
    setActiveLessonId(id);
    setCurrentPage(Page.LESSON);
  };
  const handleLessonExit = () => {
    setActiveLessonId(null);
    setCurrentPage(Page.MAP);
  };

  return (
    <>
      {currentPage === Page.LANDING && <Landing onStart={handleStart} />}
      {currentPage === Page.SETUP && <Setup onComplete={handleSetupComplete} />}
      {currentPage === Page.MAP && <MapPage onLessonSelect={handleLessonSelect} />}
      {currentPage === Page.LESSON && activeLessonId && (
        <LessonPage lessonId={activeLessonId} onExit={handleLessonExit} />
      )}
    </>
  );
};

export default App;
