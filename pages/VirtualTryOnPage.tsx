


import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import { WardrobeItem } from '../types';

interface DraggableResizableProps {
  children: React.ReactNode;
  transform: { x: number; y: number; width: number; height: number; };
  setTransform: React.Dispatch<React.SetStateAction<{ x: number; y: number; width: number; height: number; }>>;
  containerRef: React.RefObject<HTMLDivElement>;
}

const DraggableResizable: React.FC<DraggableResizableProps> = ({ children, transform, setTransform, containerRef }) => {
    const interactionRef = useRef<{ type: 'drag' | 'resize' | null, startX: number, startY: number, startTransform: typeof transform }>({ type: null, startX: 0, startY: 0, startTransform: transform });

    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        return 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent, type: 'drag' | 'resize') => {
        e.stopPropagation();
        const { x, y } = getCoords(e);
        interactionRef.current = { type, startX: x, startY: y, startTransform: transform };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchend', handleEnd);
    };

    const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!interactionRef.current.type) return;

        const { x, y } = 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
        const dx = x - interactionRef.current.startX;
        const dy = y - interactionRef.current.startY;
        
        const { type, startTransform } = interactionRef.current;

        if (type === 'drag') {
            setTransform(prev => ({ ...prev, x: startTransform.x + dx, y: startTransform.y + dy }));
        } else if (type === 'resize') {
            const newWidth = Math.max(50, startTransform.width + dx);
            const newHeight = Math.max(50, startTransform.height + dy);
            setTransform(prev => ({ ...prev, width: newWidth, height: newHeight }));
        }
    }, [setTransform]);

    const handleEnd = useCallback(() => {
        interactionRef.current.type = null;
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchend', handleEnd);
    }, [handleMove]);

    return (
        <div
            style={{
                position: 'absolute',
                left: transform.x,
                top: transform.y,
                width: transform.width,
                height: transform.height,
                cursor: 'grab',
                touchAction: 'none'
            }}
            onMouseDown={(e) => handleStart(e, 'drag')}
            onTouchStart={(e) => handleStart(e, 'drag')}
        >
            {children}
            <div
                className="absolute -bottom-2 -right-2 w-6 h-6 bg-brand-primary bg-opacity-70 rounded-full cursor-nwse-resize border-2 border-white"
                onMouseDown={(e) => handleStart(e, 'resize')}
                onTouchStart={(e) => handleStart(e, 'resize')}
            />
        </div>
    );
};


type CameraState = 'checking' | 'prompt' | 'requesting' | 'streaming' | 'denied' | 'error';

const VirtualTryOnPage: React.FC = () => {
  const { wardrobeItems, saveInspiration, findAndShowShoppingItems, isFusingLook, fuseLookError, generateFusedLook } = useAppContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>('checking');
  
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [overlayTransform, setOverlayTransform] = useState({ x: 50, y: 50, width: 150, height: 180 });
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [capturedUserImage, setCapturedUserImage] = useState<string | null>(null);
  const [fusedImage, setFusedImage] = useState<string | null>(null);

  const compatibleCategories = ['T-Shirt', 'Blouse', 'Sweater', 'Jacket', 'Dress', 'Top'];
  const compatibleItems = wardrobeItems.filter(item => compatibleCategories.some(cat => item.category.includes(cat)));

  const cleanupCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const requestCamera = useCallback(async () => {
      if (stream || capturedUserImage) return;
      setCameraState('requesting');
      try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
          setStream(mediaStream);
          if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
          }
          setCameraState('streaming');
      } catch (err) {
          setCameraState('error');
      }
  }, [stream, capturedUserImage]);

  useEffect(() => {
    requestCamera();
    return () => cleanupCamera();
  }, [requestCamera, cleanupCamera]);

  const handleSelectItem = (item: WardrobeItem) => {
    setSelectedItem(item);
    const container = videoContainerRef.current;
    if (container) {
        const containerWidth = container.clientWidth;
        const itemWidth = containerWidth / 2;
        const itemHeight = itemWidth * 1.25;
        setOverlayTransform({
            x: (containerWidth - itemWidth) / 2,
            y: container.clientHeight * 0.2,
            width: itemWidth,
            height: itemHeight
        });
    }
  };

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Mirror the captured image to match the video feed
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedUserImage(imageDataUrl);
    cleanupCamera();
  }, [cleanupCamera]);

  const handleFuseLook = async () => {
    if (!capturedUserImage || !selectedItem) return;
    const result = await generateFusedLook(capturedUserImage, selectedItem.image);
    if (result) {
        setFusedImage(result);
    }
  };

  const handleSaveFusedLook = () => {
    if (fusedImage && selectedItem) {
        saveInspiration(fusedImage, `AI Fused Look with: ${selectedItem.description}`);
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 2500);
    }
  };

  const handleShopFusedLook = () => {
    if (fusedImage) {
        findAndShowShoppingItems({ image: fusedImage });
    }
  };

  const handleReset = () => {
    setSelectedItem(null);
    setCapturedUserImage(null);
    setFusedImage(null);
    requestCamera(); // Restart camera
  };
  
  const renderBottomControls = () => {
    if (fusedImage) {
        return (
            <div className="flex items-center justify-center gap-4 animate-fadeIn">
                <button onClick={handleShopFusedLook} className="flex flex-col items-center gap-1 bg-brand-accent rounded-lg shadow-lg text-white font-bold py-2 px-4">
                    <Icon icon="shopping-cart" className="w-6 h-6" />
                    <span className="text-xs">Shop Look</span>
                </button>
                <button onClick={handleSaveFusedLook} className="flex flex-col items-center gap-1 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg text-white font-bold py-2 px-4">
                    <Icon icon="save" className="w-6 h-6" />
                    <span className="text-xs">Save Look</span>
                </button>
                <button onClick={handleReset} className="flex flex-col items-center gap-1 bg-white/30 backdrop-blur-sm rounded-lg shadow-lg text-white font-bold py-2 px-4">
                    <Icon icon="refresh" className="w-6 h-6" />
                    <span className="text-xs">Start Over</span>
                </button>
            </div>
        );
    }
    if (capturedUserImage) {
         return (
             <div className="flex items-center justify-center gap-4 animate-fadeIn">
                <button onClick={() => setCapturedUserImage(null)} className="bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-lg shadow-lg">Retake</button>
                <button onClick={handleFuseLook} className="flex items-center gap-2 bg-brand-accent text-white font-bold py-3 px-6 rounded-lg shadow-lg">
                    <Icon icon="wand-sparkles" className="w-5 h-5" />
                    Fuse with AI
                </button>
            </div>
         );
    }
    return (
         <div className="flex items-center gap-8">
            {selectedItem && (
                 <button onClick={() => setSelectedItem(null)} className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-white" aria-label="Clear item">
                    <Icon icon="close" className="w-7 h-7" />
                </button>
            )}
            <button onClick={handleCapture} disabled={!selectedItem} className="w-20 h-20 bg-white rounded-full border-4 border-brand-accent shadow-lg flex items-center justify-center disabled:bg-gray-400 transition-transform active:scale-90" aria-label="Capture photo">
                <Icon icon="camera" className="w-8 h-8 text-brand-accent" />
            </button>
             {selectedItem && <div className="w-16 h-16" />}
        </div>
    );
  };


  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between p-4 h-screen">
        {showSavedMessage && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-feedback-green text-white font-bold py-2 px-6 rounded-full shadow-lg z-50 animate-fadeIn">
                Saved to Inspirations!
            </div>
        )}
        {fuseLookError && (
             <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-feedback-red text-white font-bold py-2 px-6 rounded-full shadow-lg z-50 animate-fadeIn">
                {fuseLookError}
            </div>
        )}

      <h1 className="text-2xl font-bold text-white z-20">Look Fusion</h1>
      
      <div ref={videoContainerRef} className="absolute inset-0 w-full h-full flex items-center justify-center">
        <div className="relative w-full max-w-lg aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black">
            {fusedImage ? (
                <img src={fusedImage} alt="AI Fused try-on result" className="w-full h-full object-cover" />
            ) : capturedUserImage ? (
                <img src={capturedUserImage} alt="Captured user for try-on" className="w-full h-full object-cover" />
            ) : cameraState === 'streaming' ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                  <canvas ref={canvasRef} className="hidden" />
                </>
            ) : (
                 <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center"><LoadingSpinner text="Starting Camera..." /></div>
            )}
           
            {selectedItem && !capturedUserImage && !fusedImage && (
                <DraggableResizable transform={overlayTransform} setTransform={setOverlayTransform} containerRef={videoContainerRef}>
                    <img src={selectedItem.image} alt="try on item" className="w-full h-full object-contain pointer-events-none" draggable="false" />
                </DraggableResizable>
            )}
            {isFusingLook && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                    <LoadingSpinner text="Fusing your look..." />
                </div>
            )}
        </div>
      </div>

      <div className="absolute bottom-36 left-1/2 -translate-x-1/2 flex items-center justify-center w-full z-20">
        {renderBottomControls()}
      </div>
      
      <div className="w-full h-28 z-20 pt-4">
        {!capturedUserImage && (
            <div className="w-full h-full overflow-x-auto whitespace-nowrap pb-2">
                {compatibleItems.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-slate-400">Add tops or dresses to your wardrobe!</p>
                    </div>
                ) : (
                    compatibleItems.map(item => (
                    <button key={item.id} onClick={() => handleSelectItem(item)} className={`inline-block w-20 h-20 rounded-lg overflow-hidden mr-3 border-2 transition-all duration-200 flex-shrink-0 bg-slate-700 ${selectedItem?.id === item.id ? 'border-brand-accent scale-110' : 'border-transparent'}`}>
                        <img src={item.image} alt={item.description} className="w-full h-full object-cover" />
                    </button>
                ))
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTryOnPage;