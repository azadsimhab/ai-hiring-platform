import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Chip, alpha, useTheme } from '@mui/material';
import { Mic as MicIcon, Stop as StopIcon, RadioButtonChecked as RecordingIcon, Error as ErrorIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import HolographicButton from '../../../components/HolographicButton';

/**
 * AudioRecorder - A component for recording audio with visualizations and a countdown.
 *
 * @param {Object} props
 * @param {function(Blob): void} props.onStop - Callback function triggered when recording stops, passing the audio blob.
 * @param {number} props.maxDuration - Maximum recording duration in seconds.
 * @param {boolean} props.isRecordingActive - Prop to control recording state from parent.
 * @param {function(): void} props.onRecordingStart - Callback when recording starts.
 * @param {function(): void} props.onTimeUp - Callback when the countdown reaches zero.
 */
const AudioRecorder = ({ onStop, maxDuration = 120, isRecordingActive, onRecordingStart, onTimeUp }) => {
  const theme = useTheme();
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('inactive'); // inactive, recording, stopped
  const [countdown, setCountdown] = useState(maxDuration);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const visualizerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameId = useRef(null);

  // Function to get microphone permission
  const getMicrophonePermission = useCallback(async () => {
    if ('MediaRecorder' in window) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(mediaStream);
      } catch (err) {
        console.error('Error getting microphone permission:', err);
        setPermission(false);
      }
    } else {
      alert('The MediaRecorder API is not supported in your browser.');
    }
  }, []);

  // Request permission on mount
  useEffect(() => {
    getMicrophonePermission();
  }, [getMicrophonePermission]);

  // Handle countdown timer
  useEffect(() => {
    let interval;
    if (recordingStatus === 'recording') {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            stopRecording();
            if (onTimeUp) onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recordingStatus, onTimeUp]);

  // Control recording from parent prop
  useEffect(() => {
    if (isRecordingActive && recordingStatus !== 'recording') {
      startRecording();
    } else if (!isRecordingActive && recordingStatus === 'recording') {
      stopRecording();
    }
  }, [isRecordingActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [stream]);

  const startRecording = async () => {
    if (!permission || !stream) {
      alert('Microphone permission is required to record audio.');
      return;
    }
    setRecordingStatus('recording');
    setCountdown(maxDuration);
    if (onRecordingStart) onRecordingStart();

    const media = new MediaRecorder(stream, { type: 'audio/webm' });
    mediaRecorder.current = media;
    mediaRecorder.current.start();

    audioChunks.current = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === 'undefined') return;
      if (event.data.size === 0) return;
      audioChunks.current.push(event.data);
    };

    visualize();
  };

  const stopRecording = () => {
    if (!mediaRecorder.current) return;
    setRecordingStatus('stopped');
    mediaRecorder.current.stop();

    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      onStop(audioBlob);
      audioChunks.current = [];
    };

    // Stop visualization
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    const canvas = visualizerRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const visualize = () => {
    if (!stream) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
    }

    const analyser = analyserRef.current;
    const canvas = visualizerRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * (height / 255);

        const gradient = context.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, alpha(theme.palette.secondary.main, 0.7));
        gradient.addColorStop(1, alpha(theme.palette.primary.main, 0.9));
        context.fillStyle = gradient;
        
        context.shadowColor = theme.palette.primary.main;
        context.shadowBlur = 10;

        context.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 2, width: '100%' }}>
      <AnimatePresence>
        {recordingStatus === 'recording' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Chip
              icon={<RecordingIcon />}
              label={`Recording... ${formatTime(countdown)}`}
              color="error"
              sx={{
                fontSize: '1.1rem',
                padding: '16px 24px',
                boxShadow: `0 0 15px ${alpha(theme.palette.error.main, 0.7)}`,
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { boxShadow: `0 0 10px ${alpha(theme.palette.error.main, 0.5)}` },
                  '50%': { boxShadow: `0 0 20px ${alpha(theme.palette.error.main, 1)}` },
                  '100%': { boxShadow: `0 0 10px ${alpha(theme.palette.error.main, 0.5)}` },
                },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ width: '100%', height: 100, position: 'relative' }}>
        <canvas
          ref={visualizerRef}
          width="600"
          height="100"
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        />
        {!permission && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Chip
              icon={<ErrorIcon />}
              label="Microphone permission required"
              color="warning"
            />
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        {recordingStatus === 'inactive' ? (
          <HolographicButton
            onClick={startRecording}
            disabled={!permission}
            startIcon={<MicIcon />}
            color="success"
            glowIntensity={0.8}
            sx={{ width: 180, height: 50 }}
          >
            Start Recording
          </HolographicButton>
        ) : (
          <HolographicButton
            onClick={stopRecording}
            startIcon={<StopIcon />}
            color="error"
            glowIntensity={0.8}
            sx={{ width: 180, height: 50 }}
          >
            Stop Recording
          </HolographicButton>
        )}
      </Box>
    </Box>
  );
};

export default AudioRecorder;
