import React from 'react';
import { Volume2, VolumeX, Shield, HelpCircle, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GameSettings } from '../types/game';

interface NavbarProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onNavigate: (view: 'MENU' | 'HOW_TO_PLAY' | 'STATS' | 'SETTINGS') => void;
  currentPhase: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onUpdateSettings,
  onNavigate,
  currentPhase,
}) => {
  const toggleAudio = () => {
    const nextState = !settings.sfxEnabled;
    const newSettings = { ...settings, sfxEnabled: nextState };
    onUpdateSettings(newSettings);
    soundManager.updateSettings(
      newSettings.sfxEnabled,
      newSettings.sfxVolume,
      newSettings.musicEnabled,
      newSettings.musicVolume
    );
    if (nextState) {
      soundManager.playClick();
    }
  };

  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => {
            soundManager.playClick();
            onNavigate('MENU');
          }}
          className="flex items-center gap-2 group cursor-pointer text-left whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <span className="font-display font-black text-white text-base tracking-tighter">⚡</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-display group-hover:text-purple-300 transition-colors">
            Chaos <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Tic-Tac-Toe</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('MENU');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              currentPhase === 'MENU' ? 'text-purple-400 font-semibold' : ''
            }`}
          >
            Play
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('HOW_TO_PLAY');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentPhase === 'HOW_TO_PLAY' ? 'text-purple-400 font-semibold' : ''
            }`}
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>How to Play</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('STATS');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentPhase === 'STATS' ? 'text-purple-400 font-semibold' : ''
            }`}
          >
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <span>Statistics</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('SETTINGS');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentPhase === 'SETTINGS' ? 'text-purple-400 font-semibold' : ''
            }`}
          >
            <SettingsIcon className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Zone 3: Quick Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleAudio}
            aria-label={settings.sfxEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            title={settings.sfxEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            {settings.sfxEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          {currentPhase !== 'MENU' && (
            <button
              onClick={() => {
                soundManager.playClick();
                onNavigate('MENU');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Main Menu
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
