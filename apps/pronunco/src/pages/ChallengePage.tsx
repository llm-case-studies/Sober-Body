import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { usePronunciationCoach } from '../../../sober-body/src/features/games/PronunciationCoach';
import { makeShareCard } from '../makeShareCard';
import confetti from 'canvas-confetti';

const backgroundThemes = [
  'bg-gradient-to-br from-blue-100 via-indigo-100 to-cyan-100',
  'bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100',
  'bg-gradient-to-br from-amber-100 via-orange-100 to-red-100',
  'bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100',
  'bg-gradient-to-br from-purple-100 via-violet-100 to-pink-100'
];

interface ChallengePayload {
  id: string;
  title: string;
  units: string[];
  lang: string;
  grammar?: string;
}

interface FriendScore {
  challengeId: string;
  bestScore: number;
  attempts: number;
}

export default function ChallengePage() {
  const { data } = useParams<{ data: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<ChallengePayload | null>(null);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(0); // Moved here

  const friendScore = useLiveQuery(
    () => db().friend_scores.get(challenge?.id || ''),
    [challenge?.id]
  );

  const attemptsLeft = friendScore ? 5 - friendScore.attempts : 5;
  const bestScore = friendScore?.bestScore ?? 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTheme(prev => (prev + 1) % backgroundThemes.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (data) {
      console.log('Received data param:', data);
      try {
        const decoded = JSON.parse(atob(data)) as ChallengePayload;
        console.log('Decoded payload:', decoded);
        setChallenge(decoded);
        db().challenges.put(decoded);
      } catch (e) {
        console.error("Failed to parse challenge data", e);
        navigate('/'); // Redirect to home if data is invalid
      }
    }
  }, [data, navigate]);

  const currentUnit = challenge?.units[currentUnitIndex] || '';
  const coach = usePronunciationCoach({
    phrase: currentUnit,
    locale: challenge?.lang || 'en-US',
    onScore: useCallback(async (result: { score: number; transcript: string; millis: number }) => {
      setCurrentScore(result.score);
      if (challenge) {
        const currentFriendScore = (await db().friend_scores.get(challenge.id)) || {
          challengeId: challenge.id,
          bestScore: 0,
          attempts: 0,
        };
        const newAttempts = currentFriendScore.attempts + 1;
        const newBestScore = Math.max(currentFriendScore.bestScore, result.score);

        await db().friend_scores.put({
          ...currentFriendScore,
          attempts: newAttempts,
          bestScore: newBestScore,
        });

        if (result.score >= 80) {
          confetti({ particleCount: 80, spread: 55 });
        }
      }
    }, [challenge])
  });

  const handlePlayRecord = () => {
    if (coach.recording) {
      coach.stop();
    } else {
      coach.start();
    }
  };

  const handleShareScore = async () => {
    if (!challenge || !friendScore) return;

    const blob = await makeShareCard(friendScore.bestScore, challenge.title);
    const file = new File([blob], 'score.png', { type: 'image/png' });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text: `Beat my ${friendScore.bestScore}% in ${challenge.title}!` });
    } else {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleTryAgainForFun = async () => {
    if (challenge) {
      const currentFriendScore = (await db().friend_scores.get(challenge.id)) || {
        challengeId: challenge.id,
        bestScore: 0,
        attempts: 0,
      };
      await db().friend_scores.put({
        ...currentFriendScore,
        attempts: 0, // Reset attempts for fun
      });
    }
  };

  if (!challenge) {
    return <div className="min-h-screen py-8 flex items-center justify-center">Loading challenge...</div>;
  }

  const playButtonDisabled = friendScore && friendScore.attempts >= 5 && attemptsLeft <= 0;

  return (
    <div className={`min-h-screen py-8 transition-all duration-1000 ${backgroundThemes[currentTheme]}`}>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
        <div className="h-1 bg-gray-200 rounded"></div>
        <p className="text-gray-600">{challenge.units.length} quick lines</p>

        {challenge.grammar && (
          <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-3 rounded">
            <p className="font-medium">Grammar Focus:</p>
            <p className="text-sm">{challenge.grammar}</p>
          </div>
        )}

        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{currentUnit}</h2>
          <button
            onClick={handlePlayRecord}
            disabled={playButtonDisabled}
            className={`px-6 py-3 rounded-md text-white font-bold transition-colors ${playButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none'}`}
          >
            {coach.recording ? '■ Stop Recording' : '▶ Play / Record'}
          </button>
        </div>

        {currentScore !== null && (
          <div className="text-center text-sm text-gray-600">
            <p>Last Score: {currentScore}%</p>
          </div>
        )}

        <div className="text-center text-sm text-gray-600">
          <p>Attempts left: {attemptsLeft}</p>
          {bestScore > 0 && (
            <p>Best score so far: {bestScore}%</p>
          )}
        </div>

        {friendScore && (
          <div className="text-center">
            <button
              onClick={handleShareScore}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
            >
              Share my score
            </button>
            {friendScore.attempts >= 5 && (
              <p className="text-xs text-gray-500 mt-2">
                <button onClick={handleTryAgainForFun} className="underline">Try again for fun (doesn’t count)</button>
              </p>
            )}
          </div>
        )}

        {showToast && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg">
            Card copied – paste into chat!
          </div>
        )}
      </div>
    </div>
  );
}
