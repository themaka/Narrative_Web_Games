// =============================================================================
// useAudio — Manages background music and sound effects via Howler.js
// =============================================================================

import { useRef, useCallback, useState } from 'react';
import { Howl } from 'howler';

interface AudioControls {
  /** Play or change background music (loops). Pass "stop" to silence. */
  playMusic: (src: string) => void;
  /** Play a one-shot sound effect */
  playSoundEffect: (src: string) => void;
  /** Set music volume (0-1) */
  setMusicVolume: (vol: number) => void;
  /** Set SFX volume (0-1) */
  setSfxVolume: (vol: number) => void;
  /** Toggle mute on/off */
  toggleMute: () => void;
  /** Current mute state */
  isMuted: boolean;
  /** Current music volume */
  musicVolume: number;
  /** Current SFX volume */
  sfxVolume: number;
}

export function useAudio(): AudioControls {
  const musicRef = useRef<Howl | null>(null);
  const currentMusicSrc = useRef<string>('');
  const [musicVolume, setMusicVolumeState] = useState(0.5);
  const [sfxVolume, setSfxVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  const playMusic = useCallback(
    (src: string) => {
      // "stop" command
      if (src === 'stop') {
        if (musicRef.current) {
          musicRef.current.fade(musicRef.current.volume(), 0, 500);
          setTimeout(() => {
            musicRef.current?.stop();
            musicRef.current?.unload();
            musicRef.current = null;
          }, 500);
        }
        currentMusicSrc.current = '';
        return;
      }

      // Same track already playing — do nothing
      if (src === currentMusicSrc.current && musicRef.current?.playing()) {
        return;
      }

      // Stop current music
      if (musicRef.current) {
        musicRef.current.stop();
        musicRef.current.unload();
      }

      // Start new track
      const howl = new Howl({
        src: [src],
        loop: true,
        volume: isMuted ? 0 : musicVolume,
      });
      howl.play();
      musicRef.current = howl;
      currentMusicSrc.current = src;
    },
    [isMuted, musicVolume]
  );

  const playSoundEffect = useCallback(
    (src: string) => {
      const sfx = new Howl({
        src: [src],
        volume: isMuted ? 0 : sfxVolume,
      });
      sfx.play();
    },
    [isMuted, sfxVolume]
  );

  const setMusicVolume = useCallback((vol: number) => {
    setMusicVolumeState(vol);
    if (musicRef.current) {
      musicRef.current.volume(vol);
    }
  }, []);

  const setSfxVolume = useCallback((vol: number) => {
    setSfxVolumeState(vol);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (musicRef.current) {
        musicRef.current.mute(newMuted);
      }
      return newMuted;
    });
  }, []);

  return {
    playMusic,
    playSoundEffect,
    setMusicVolume,
    setSfxVolume,
    toggleMute,
    isMuted,
    musicVolume,
    sfxVolume,
  };
}
