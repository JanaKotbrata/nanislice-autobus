import { useState, useRef, useEffect, useContext } from "react";
import AudioContext from "../../context/audio.js";
import { useAuth } from "./auth-context-provider.jsx";

function AudioProvider({ children }) {
  const { user } = useAuth();
  const [volume, setVolumeState] = useState(() => {
    return (
      parseFloat(localStorage.getItem("app_volume")) || user?.volume || 0.5
    );
  });
  const [muted, setMutedState] = useState(() => {
    return localStorage.getItem("app_muted") === "true";
  });
  const audiosRef = useRef({});
  const indexRef = useRef(0);
  const volumeRef = useRef(volume);

  function setVolume(val) {
    setVolumeState(val);
    localStorage.setItem("app_volume", val);
  }

  function setMuted(val) {
    setMutedState(val);
    localStorage.setItem("app_muted", val);
  }

  function playSound(src, loop = false, delay = 0) {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = muted ? 0 : volumeRef.current;

    if (delay > 0) {
      setTimeout(() => audio.play().catch(() => {}), delay);
    } else {
      audio.play().catch(() => {});
    }

    indexRef.current++;
    const audioIndex = indexRef.current;
    audiosRef.current[audioIndex] = audio;
    audio.stopAndRemove = () => {
      audio.pause();
      delete audiosRef.current[audioIndex];
    };
    audio.addEventListener("ended", audio.stopAndRemove);
    return audio;
  }

  useEffect(() => {
    Object.values(audiosRef.current).forEach((a) => {
      a.volume = muted ? 0 : volume;
    });
    volumeRef.current = volume;
  }, [volume, muted]);

  useEffect(() => {
    if (user?.volume !== undefined) {
      console.log("setting volume from user profile", user.volume);
      setVolumeState(user.volume);
    }
  }, [user?.volume]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "app_volume") {
        setVolumeState(parseFloat(e.newValue));
      }
      if (e.key === "app_muted") {
        setMutedState(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <AudioContext.Provider
      value={{ volume, setVolume, muted, setMuted, playSound }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}

export default AudioProvider;
