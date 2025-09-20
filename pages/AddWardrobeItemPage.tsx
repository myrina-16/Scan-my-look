
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';

type CameraState = 'checking' | 'prompt' | 'requesting' | 'streaming' | 'denied' | 'error';

const AddWardrobeItemPage: React.FC = () => {
  const { addWardrobeItem, setIsLoading, setError, isLoading } = useAppContext();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>('checking');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const analysisMessages = [
      "Analyzing your item...",
      "Identifying category and color...",
      "Removing background (just kidding!)...",
      "Adding to your virtual closet...",
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
      }, 2000);
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

  useEffect(() => {
    return () => cleanupCamera();
  }, [cleanupCamera]);
  
  const requestCamera = useCallback(async () => {
    if (cameraState === 'streaming') return;
    setCameraState('requesting');
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Prefer rear camera
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
          setCameraError("Camera access has been denied. Please enable camera permissions in your settings.");
        } else {
          setCameraState('error');
          setCameraError("Could not access camera. Is it in use by another app?");
        }
      } else {
        setCameraState('error');
        setCameraError("An unknown error occurred while accessing the camera.");
      }
    }
  }, [cameraState]);

  useEffect(() => {
    requestCamera(); // Try to start camera immediately
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
    cleanupCamera();

    try {
      await addWardrobeItem(imageDataUrl);
      navigate('/library');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
      console.error("Item analysis failed:", e);
      setError(errorMessage);
      navigate('/library'); // Go back to library on error
    } finally {
      setIsLoading(false);
    }
  }, [cameraState, addWardrobeItem, setIsLoading, setError, navigate, cleanupCamera]);

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
          case 'requesting':
              return (
                  <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center">
                      <LoadingSpinner text="Starting camera..." />
                  </div>
              );
          case 'prompt': // This state is less likely now but kept as a fallback
              return (
                  <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center text-center p-8">
                      <Icon icon="camera" className="w-16 h-16 text-brand-secondary mb-4" />
                      <button onClick={requestCamera} className="bg-brand-accent text-white font-bold py-3 px-8 rounded-lg">
                          Enable Camera
                      </button>
                  </div>
              );
          case 'denied':
          case 'error':
              return (
                   <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center text-center p-8">
                      <Icon icon="close" className="w-16 h-16 text-feedback-red mb-4" />
                      <h2 className="text-2xl font-bold text-white mb-2">{cameraState === 'denied' ? 'Camera Access Denied' : 'Camera Problem'}</h2>
                      <p className="text-slate-300 max-w-sm mb-6">{cameraError}</p>
                      <button onClick={requestCamera} className="bg-brand-secondary text-white font-bold py-3 px-8 rounded-lg">
                          Try Again
                      </button>
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
      <button onClick={() => navigate('/library')} className="absolute top-4 left-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-10">
          <Icon icon="arrow-left" />
      </button>
      <div className="w-full max-w-lg text-center mb-4">
          <h1 className="text-2xl font-bold text-white">Add to Wardrobe</h1>
          <p className="text-slate-300">Place an item on a plain background for best results.</p>
      </div>
      <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden shadow-2xl bg-black">
        {renderCameraState()}
      </div>
      
      {cameraState === 'streaming' && (
        <div className="mt-8 text-center">
            <button
                onClick={handleCapture}
                className="w-20 h-20 bg-white rounded-full border-4 border-brand-accent shadow-lg flex items-center justify-center transition-transform duration-200 active:scale-90 mx-auto"
                aria-label="Capture item"
            >
                <Icon icon="camera" className="w-8 h-8 text-brand-accent" />
            </button>
        </div>
      )}
    </div>
  );
};

export default AddWardrobeItemPage;