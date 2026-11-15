import React, { useState } from 'react';
import { X, Volume2, Music, Vibrate, ShieldCheck, Trash2, Check, AlertTriangle } from 'lucide-react';
import { GameSettings } from '../types/game';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onResetStats: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetStats,
  onClose,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const handleToggleSfx = () => {
    const next = !settings.sfxEnabled;
    const updated = { ...settings, sfxEnabled: next };
    onUpdateSettings(updated);
    soundManager.updateSettings(
      updated.sfxEnabled,
      updated.sfxVolume,
      updated.musicEnabled,
      updated.musicVolume
    );
    if (next) soundManager.playClick();
  };

  const handleToggleMusic = () => {
    const next = !settings.musicEnabled;
    const updated = { ...settings, musicEnabled: next };
    onUpdateSettings(updated);
    soundManager.updateSettings(
      updated.sfxEnabled,
      updated.sfxVolume,
      updated.musicEnabled,
      updated.musicVolume
    );
    soundManager.playClick();
  };

  const handleSfxVolume = (val: number) => {
    const updated = { ...settings, sfxVolume: val };
    onUpdateSettings(updated);
    soundManager.updateSettings(
      updated.sfxEnabled,
      val,
      updated.musicEnabled,
      updated.musicVolume
    );
  };

  const handleMusicVolume = (val: number) => {
    const updated = { ...settings, musicVolume: val };
    onUpdateSettings(updated);
    soundManager.updateSettings(
      updated.sfxEnabled,
      updated.sfxVolume,
      updated.musicEnabled,
      val
    );
  };

  const handleToggleScreenShake = () => {
    soundManager.playClick();
    onUpdateSettings({ ...settings, screenShake: !settings.screenShake });
  };

  const handleTogglePrivacy = () => {
    soundManager.playClick();
    onUpdateSettings({ ...settings, privacyHandover: !settings.privacyHandover });
  };

  const handleResetData = () => {
    soundManager.playClick();
    onResetStats();
    setConfirmReset(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold font-display text-white">Audio & Game Settings</h2>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-5">
          {/* SFX Toggle & Slider */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-5 h-5 text-cyan-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Sound Effects</span>
                  <span className="text-[11px] text-slate-400">Moves, abilities, explosions</span>
                </div>
              </div>
              <button
                onClick={handleToggleSfx}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.sfxEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    settings.sfxEnabled ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {settings.sfxEnabled && (
              <div className="pt-2">
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => handleSfxVolume(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Synth Ambient Music Toggle & Slider */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Music className="w-5 h-5 text-purple-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Arcade Ambient Synth</span>
                  <span className="text-[11px] text-slate-400">Procedural cyber synth soundtrack</span>
                </div>
              </div>
              <button
                onClick={handleToggleMusic}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.musicEnabled ? 'bg-purple-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    settings.musicEnabled ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {settings.musicEnabled && (
              <div className="pt-2">
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => handleMusicVolume(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Screen Shake Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Vibrate className="w-5 h-5 text-red-400" />
              <div>
                <span className="text-xs font-bold text-white block">Screen Shake</span>
                <span className="text-[11px] text-slate-400">Nuclear explosions & critical moves</span>
              </div>
            </div>
            <button
              onClick={handleToggleScreenShake}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.screenShake ? 'bg-red-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  settings.screenShake ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Privacy Handover Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white block">Local Privacy Handover</span>
                <span className="text-[11px] text-slate-400">Cover screen between 1v1 turns & drafts</span>
              </div>
            </div>
            <button
              onClick={handleTogglePrivacy}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.privacyHandover ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  settings.privacyHandover ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Reset All Statistics */}
          <div className="pt-2 border-t border-slate-800">
            {confirmReset ? (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 flex flex-col gap-2">
                <span className="text-xs text-red-200 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Erase all career statistics and achievements?
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetData}
                    className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-950/60 hover:bg-red-950/30 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Local Stats & Achievements</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
