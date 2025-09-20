import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { analyzeLook } from '../services/geminiService';
import { Icon } from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';

type CameraState = 'checking' | 'prompt' | 'requesting' | 'streaming' | 'denied' | 'error';

const ScanPage: React.FC = () => {
  const { occasion, setScannedImage, setAnalysisResult, setIsLoading, setError, isLoading } = useAppContext();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>('checking');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const analysisMessages = [
      "Analyzing your silhouette...",
      "Detecting color palette...",
      "Cross-referencing style guides...",
      "Assessing fabric and texture...",
      "Finalizing recommendations...",
  ];
  const [currentMessage, setCurrentMessage] = useState(analysisMessages[0]);
  
  useEffect(() => {
    let interval: number;
    if (isLoading) {
      setCurrentMessage(analysisMessages[0]);
      interval = window.setInterval(() => {
        setCurrentMessage(prev => {
          const currentIndex = analysisMessages.indexOf(prev);
          return analysisMessages[(currentIndex + 1) % analysisMessages.length];
        });
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const cleanupCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCamera();
    };
  }, [cleanupCamera]);
  
  const requestCamera = useCallback(async () => {
    if (cameraState === 'streaming') return;
    setCameraState('requesting');
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraState('streaming');
    } catch (err) {
      console.error("Camera access error:", err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraState('denied');
          setCameraError("Camera access has been denied. Please enable camera permissions for this site in your browser settings.");
        } else if (err.name === 'NotFoundError') {
           setCameraState('error');
           setCameraError("No camera found. Please ensure a camera is connected and not in use by another application.");
        } else {
          setCameraState('error');
          setCameraError("An unknown error occurred while accessing the camera.");
        }
      } else {
        setCameraState('error');
        setCameraError("An unknown error occurred while accessing the camera.");
      }
    }
  }, [cameraState]);


  useEffect(() => {
    const checkPermissions = async () => {
      if (typeof navigator.permissions?.query !== 'function') {
        console.warn("Permissions API not supported, falling back to prompt.");
        setCameraState('prompt');
        return;
      }
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        
        if (permissionStatus.state === 'granted') {
          requestCamera();
        } else if (permissionStatus.state === 'prompt') {
          setCameraState('prompt');
        } else if (permissionStatus.state === 'denied') {
          setCameraState('denied');
          setCameraError("Camera access has been denied. Please enable camera permissions for this site in your browser settings.");
        }
        
        permissionStatus.onchange = () => {
           if (permissionStatus.state === 'denied') {
             setCameraState('denied');
             setCameraError("Camera access has been denied. Please enable camera permissions for this site in your browser settings.");
           } else {
             // If permission is granted or prompted, show the button to let the user initiate.
             setCameraState('prompt');
           }
        };

      } catch (err) {
        console.error("Error checking camera permissions:", err, "Falling back to default prompt behavior.");
        setCameraState('prompt');
      }
    };

    checkPermissions();
  }, [requestCamera]);


  const handleCapture = useCallback(async () => {
    if (cameraState !== 'streaming' || !videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if(context){
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    const base64Image = imageDataUrl.split(',')[1];
    setScannedImage(imageDataUrl);
    
    cleanupCamera();
    setCameraState('prompt'); // Reset for next time

    try {
      const result = await analyzeLook(base64Image, occasion);
      setAnalysisResult(result);
      navigate('/results');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
      console.error("Analysis failed:", e);
      setError(errorMessage);
      navigate('/'); // Go back home on error
    } finally {
      setIsLoading(false);
    }
  }, [cameraState, occasion, setScannedImage, setAnalysisResult, setIsLoading, setError, navigate, cleanupCamera]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-brand-primary text-white p-4">
        <LoadingSpinner text={currentMessage} />
      </div>
    );
  }
  
  const renderCameraState = () => {
      switch (cameraState) {
          case 'checking':
              return (
                  <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center">
                      <LoadingSpinner text="Checking permissions..." />
                  </div>
              );
          case 'prompt':
          case 'requesting':
              return (
                  <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center text-center p-8">
                      {cameraState === 'requesting' ? (
                          <LoadingSpinner text="Waiting for camera..." />
                      ) : (
                          <>
                              <Icon icon="camera" className="w-16 h-16 text-brand-secondary mb-4" />
                              <h2 className="text-2xl font-bold text-white mb-2">Ready to Scan?</h2>
                              <p className="text-slate-300 mb-6">Tap the button below to start your camera.</p>
                              <button
                                  onClick={requestCamera}
                                  className="bg-brand-accent text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-opacity-90 transition-all"
                              >
                                  Enable Camera
                              </button>
                          </>
                      )}
                  </div>
              );
          case 'denied':
              return (
                   <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center text-center p-8">
                      <Icon icon="close" className="w-16 h-16 text-feedback-red mb-4" />
                      <h2 className="text-2xl font-bold text-white mb-2">Camera Access Denied</h2>
                      <p className="text-slate-300 max-w-sm mb-4">{cameraError}</p>
                      <p className="text-xs text-slate-400 max-w-sm mb-6">You may need to go into your browser's site settings to re-enable the camera.</p>
                      <button
                          onClick={requestCamera}
                          className="bg-brand-secondary text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-opacity-90 transition-all"
                      >
                          Try Again
                      </button>
                  </div>
              );
          case 'error':
              return (
                  <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center text-center p-8">
                      <Icon icon="close" className="w-16 h-16 text-feedback-red mb-4" />
                      <h2 className="text-2xl font-bold text-white mb-2">Camera Problem</h2>
                      <p className="text-slate-300 max-w-sm">{cameraError}</p>
                  </div>
              );
          case 'streaming':
              return (
                  <>
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <canvas ref={canvasRef} className="hidden" />
                  </>
              );
          default:
              return null;
      }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-10">
          <Icon icon="arrow-left" />
      </button>
      <div className="relative w-full max-w-lg aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black">
        {renderCameraState()}
      </div>
      
      {cameraState === 'streaming' && (
        <div className="mt-8 text-center">
            <button
                onClick={handleCapture}
                className="w-20 h-20 bg-white rounded-full border-4 border-brand-accent shadow-lg flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform duration-200 active:scale-90 mx-auto"
                aria-label="Capture photo"
            >
                <Icon icon="camera" className="w-8 h-8 text-brand-accent" />
            </button>
            <p className="mt-4 text-white font-medium">Tap to scan for {occasion}</p>
        </div>
      )}
    </div>
  );
};

export default ScanPage;
