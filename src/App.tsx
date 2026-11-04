import { useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { HelpModal } from './components/game/HelpModal';
import {
  createInitialState,
  gameReducer,
  mesasSuperadas,
  shuffleSeed,
} from './game/engine';
import { sortRanking } from './game/ranking';
import {
  MUTED_STORAGE_KEY,
  RANKING_STORAGE_KEY,
  TUTORIAL_STORAGE_KEY,
} from './game/rounds';
import type { RankEntry } from './game/types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSound } from './hooks/useSound';
import { GameScreen } from './screens/GameScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { NameScreen } from './screens/NameScreen';
import { PrintGuideScreen } from './screens/PrintGuideScreen';
import { RunEndScreen } from './screens/RunEndScreen';
import { ShopScreen } from './screens/ShopScreen';
import { StartScreen } from './screens/StartScreen';
import { TutorialScreen } from './screens/TutorialScreen';

type Screen = 'menu' | 'tutorial' | 'name' | 'game' | 'ranking' | 'print';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [returnScreen, setReturnScreen] = useState<Screen>('menu');
  const [printReturnScreen, setPrintReturnScreen] = useState<Screen>('menu');
  const [tutorialNext, setTutorialNext] = useState<'name' | 'menu'>('name');
  const [helpOpen, setHelpOpen] = useState(false);

  const [game, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const [ranking, setRanking] = useLocalStorage<RankEntry[]>(RANKING_STORAGE_KEY, []);
  const [muted, setMuted] = useLocalStorage<boolean>(MUTED_STORAGE_KEY, false);
  const [seenTutorial, setSeenTutorial] = useLocalStorage<boolean>(
    TUTORIAL_STORAGE_KEY,
    false,
  );

  const { play } = useSound(muted);
  const savedRunRef = useRef<string | null>(null);
  const announcedRunRef = useRef<string | null>(null);

  const bestScore = sortRanking(ranking)[0]?.score ?? 0;

  useEffect(() => {
    if (screen !== 'game' || game.phase !== 'playing' || helpOpen) return;
    let previous = performance.now();
    const interval = window.setInterval(() => {
      const now = performance.now();
      dispatch({ type: 'TICK', delta: now - previous });
      previous = now;
    }, 250);
    return () => window.clearInterval(interval);
  }, [game.phase, helpOpen, screen]);

  useEffect(() => {
    const finished = game.phase === 'runLost' || game.phase === 'runComplete';
    if (!finished || savedRunRef.current === game.runId) return;

    savedRunRef.current = game.runId;
    const entry: RankEntry = {
      id: game.runId,
      name: game.player || 'JUGADOR',
      score: game.runScore,
      mesas: mesasSuperadas(game),
      timeMs: game.elapsedMs,
      date: Date.now(),
      won: game.phase === 'runComplete',
      bestHand: game.bestHand?.name ?? '—',
    };
    setRanking((previous) => [...previous, entry]);
  }, [
    game.phase,
    game.runId,
    game.player,
    game.runScore,
    game.elapsedMs,
    game.bestHand,
    game.roundIndex,
    setRanking,
  ]);

  useEffect(() => {
    if (game.phase !== 'runComplete' && game.phase !== 'runLost') return;
    if (announcedRunRef.current === game.runId) return;

    announcedRunRef.current = game.runId;
    play(game.phase === 'runComplete' ? 'win' : 'lose');
  }, [game.phase, game.runId, play]);

  const toggleMute = () => {
    setMuted((value) => !value);
  };

  const openHelp = () => {
    play('click');
    setHelpOpen(true);
  };

  const openPrintGuide = (from: Screen) => {
    play('click');
    setPrintReturnScreen(from);
    setHelpOpen(false);
    setScreen('print');
  };

  const playGame = () => {
    play('click');
    if (!seenTutorial) {
      setTutorialNext('name');
      setScreen('tutorial');
      return;
    }
    setScreen('name');
  };

  const openTutorial = () => {
    play('click');
    setTutorialNext('menu');
    setScreen('tutorial');
  };

  const finishTutorial = () => {
    play('click');
    setSeenTutorial(true);
    setScreen(tutorialNext === 'name' ? 'name' : 'menu');
  };

  const startRun = (name: string) => {
    play('click');
    dispatch({ type: 'START_RUN', player: name, seed: shuffleSeed() });
    setScreen('game');
  };

  const playAgain = () => {
    play('click');
    dispatch({ type: 'START_RUN', player: game.player, seed: shuffleSeed() });
    setScreen('game');
  };

  const nextPlayer = () => {
    play('click');
    setScreen('name');
  };

  const openRanking = (from: Screen) => {
    play('click');
    setReturnScreen(from);
    setScreen('ranking');
  };

  const backFromRanking = () => {
    play('click');
    setScreen(returnScreen);
  };

  const resetRanking = () => {
    play('click');
    setRanking([]);
  };

  let content: ReactNode;

  if (screen === 'menu') {
    content = (
      <StartScreen
        ranking={ranking}
        muted={muted}
        onPlay={playGame}
        onTutorial={openTutorial}
        onRanking={() => openRanking('menu')}
        onPrint={() => openPrintGuide('menu')}
        onToggleMute={toggleMute}
        onHelp={openHelp}
      />
    );
  } else if (screen === 'tutorial') {
    content = (
      <TutorialScreen
        nextLabel={tutorialNext === 'name' ? 'EMPIEZA A JUGAR' : 'VOLVER AL MENÚ'}
        onDone={finishTutorial}
        onBack={() => setScreen('menu')}
      />
    );
  } else if (screen === 'name') {
    content = (
      <NameScreen
        lastPlayer={game.player}
        bestScore={bestScore}
        onStart={startRun}
        onBack={() => setScreen('menu')}
      />
    );
  } else if (screen === 'ranking') {
    content = (
      <LeaderboardScreen
        ranking={ranking}
        muted={muted}
        onBack={backFromRanking}
        onReset={resetRanking}
        onToggleMute={toggleMute}
        onHelp={openHelp}
      />
    );
  } else if (screen === 'print') {
    content = (
      <PrintGuideScreen
        onBack={() => {
          play('click');
          setScreen(printReturnScreen);
        }}
      />
    );
  } else if (game.phase === 'shop') {
    content = (
      <ShopScreen
        state={game}
        dispatch={dispatch}
        playSound={play}
        muted={muted}
        onToggleMute={toggleMute}
        onHelp={openHelp}
      />
    );
  } else if (game.phase === 'runLost' || game.phase === 'runComplete') {
    content = (
      <RunEndScreen
        state={game}
        ranking={ranking}
        muted={muted}
        onToggleMute={toggleMute}
        onHelp={openHelp}
        onPlayAgain={playAgain}
        onNextPlayer={nextPlayer}
        onRanking={() => openRanking('game')}
        onMenu={() => {
          play('click');
          setScreen('menu');
        }}
      />
    );
  } else {
    content = (
      <GameScreen
        state={game}
        dispatch={dispatch}
        playSound={play}
        muted={muted}
        onToggleMute={toggleMute}
        onHelp={openHelp}
      />
    );
  }

  return (
    <>
      {content}
      <HelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        onPrint={screen === 'print' ? undefined : () => openPrintGuide(screen)}
      />
    </>
  );
}
