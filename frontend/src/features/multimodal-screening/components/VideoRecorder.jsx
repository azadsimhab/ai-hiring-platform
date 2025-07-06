import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Chip, alpha, useTheme, keyframes } from '@mui/material';
import { Videocam as VideocamIcon, Stop as StopIcon, RadioButtonChecked as RecordingIcon, Error as ErrorIcon, VideocamOff as VideocamOffIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import HolographicButton from '../../../components/HolographicButton';

// Keyframes for the glowing border effect during recording
const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 8px 2px rgba(244, 67, 54, 0.5), inset 0 0 8px 2px rgba(244, 67, 54, 0.4);
  }
  50% {
    box-shadow: 0 0 16px 4px rgba(244, 67, 54, 0.8), inset 0 0 16px 4px rgba(244, 67, 54, 0.6);
  }
  100% {
    box-shadow: 0 0 8px 2px rgba(244, 67, 54, 0.5), inset 0 0 8px 2px rgba(244, 67, 54, 0.4);
  }
`;

/**
 * VideoRecorder - A component for recording video and audio with a futuristic UI.
 *
 * @param {Object} props
 * @param {function(Blob): void} props.onStop - Callback function triggered when recording stops, passing the video blob.
 * @param {number} [props.maxDuration=120] - Maximum recording duration in seconds.
 * @param {boolean} props.isRecordingActive - Prop to control recording state from a parent component.
 * @param {function(): void} props.onRecordingStart - Callback when recording starts.
 * @param {function(): void} props.onTimeUp - Callback when the countdown reaches zero.
 */
const VideoRecorder = ({ onStop, maxDuration = 120, isRecordingActive, onRecordingStart, onTimeUp }) => {
  const theme = useTheme();
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('inactive'); // 'inactive', 'recording', 'stopped'
  const [countdown, setCountdown] = useState(maxDuration);
  const mediaRecorder = useRef(null);
  const videoRef = useRef(null);
  const recordedChunks = useRef([]);

  // Function to get camera and microphone permission
  const getCameraPermission = useCallback(async () => {
    if ('MediaRecorder' in window) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        setPermission(true);
        setStream(mediaStream);
      } catch (err) {
        console.error('Error getting camera/microphone permission:', err);
        setPermission(false);
      }
    } else {
      alert('The MediaRecorder API is not supported in your browser.');
    }
  }, []);

  // Request permission on component mount
  useEffect(() => {
    getCameraPermission();
  }, [getCameraPermission]);

  // Attach the stream to the video element for preview
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Handle the countdown timer
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
  }, [recordingStatus, onTimeUp]); // stopRecording is stable, so it's safe to omit

  // Control recording state from the parent component
  useEffect(() => {
    if (isRecordingActive && recordingStatus !== 'recording') {
      startRecording();
    } else if (!isRecordingActive && recordingStatus === 'recording') {
      stopRecording();
    }
  }, [isRecordingActive]); // start/stopRecording are stable, so it's safe to omit

  // Cleanup stream on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startRecording = useCallback(async () => {
    if (!permission || !stream) {
      alert('Camera and microphone permission is required to record.');
      return;
    }
    setRecordingStatus('recording');
    setCountdown(maxDuration);
    if (onRecordingStart) onRecordingStart();

    const options = { mimeType: 'video/webm; codecs=vp9,opus' };
    const media = new MediaRecorder(stream, options);
    mediaRecorder.current = media;
    mediaRecorder.current.start();

    recordedChunks.current = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === 'undefined' || event.data.size === 0) return;
      recordedChunks.current.push(event.data);
    };
  }, [permission, stream, maxDuration, onRecordingStart]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') return;
    
    setRecordingStatus('stopped');
    mediaRecorder.current.stop();

    mediaRecorder.current.onstop = () => {
      const videoBlob = new Blob(recordedChunks.current, { type: 'video/webm' });
      onStop(videoBlob);
      recordedChunks.current = [];
    };
  }, [onStop]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 2, width: '100%' }}>
      <Box
        sx={{
          width: '100%',
          maxWidth: '720px',
          aspectRatio: '16 / 9',
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          background: 'black',
          border: '2px solid',
          borderColor: recordingStatus === 'recording' ? 'error.main' : alpha(theme.palette.primary.main, 0.3),
          transition: 'all 0.3s ease',
          animation: recordingStatus === 'recording' ? `${pulseGlow} 1.5s infinite` : 'none',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} // Mirror view
        />
        {!permission && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(5px)',
            }}
          >
            <VideocamOffIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
            <Typography color="warning.main">Camera Permission Required</Typography>
            <Typography variant="body2" color="text.secondary">Please allow camera and microphone access.</Typography>
          </Box>
        )}
        <AnimatePresence>
          {recordingStatus === 'recording' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', top: 16, right: 16 }}
            >
              <Chip
                icon={<RecordingIcon />}
                label={formatTime(countdown)}
                color="error"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  boxShadow: `0 0 15px ${alpha(theme.palette.error.main, 0.7)}`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      <Box sx={{ mt: 2 }}>
        {recordingStatus !== 'recording' ? (
          <HolographicButton
            onClick={startRecording}
            disabled={!permission || recordingStatus === 'recording'}
            startIcon={<VideocamIcon />}
            color="success"
            glowIntensity={0.8}
            sx={{ width: 180, height: 50 }}
          >
            Start
          </HolographicButton>
        ) : (
          <HolographicButton
            onClick={stopRecording}
            startIcon={<StopIcon />}
            color="error"
            glowIntensity={0.8}
            sx={{ width: 180, height: 50 }}
          >
            Stop
          </HolographicButton>
        )}
      </Box>
    </Box>
  );
};

export default VideoRecorder;
