import { useEffect, useState } from "react";

const useAudioData = () => {
  const [audioData, setAudioData] = useState(new Uint8Array(0));

  useEffect(() => {
    const startAudioProcessing = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateAudioData = () => {
        analyser.getByteFrequencyData(dataArray);
        setAudioData([...dataArray]);
        requestAnimationFrame(updateAudioData);
      };

      updateAudioData();
    };

    startAudioProcessing();
  }, []);

  return audioData;
};

export default useAudioData;
