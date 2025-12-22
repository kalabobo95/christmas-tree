
import React, { useEffect, useRef } from 'react';
import { GestureState } from '../types';

interface HandTrackerProps {
  onGestureUpdate: (gesture: GestureState, x: number, y: number) => void;
}

declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

const HandTracker: React.FC<HandTrackerProps> = ({ onGestureUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastX = useRef<number>(0.5);
  const lastGesture = useRef<GestureState>('idle');
  const lastPalmX = useRef<number>(0.5);
  const lastPalmY = useRef<number>(0.5);
  const POSITION_THRESHOLD = 0.05;

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const hands = new window.Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    hands.onResults((results: any) => {
      const canvasCtx = canvasRef.current!.getContext('2d')!;
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Basic gesture logic
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        const palmBase = landmarks[0];

        // Distance heuristic
        const dist = (p1: any, p2: any) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
        
        const isFist = dist(indexTip, palmBase) < 0.2 && dist(middleTip, palmBase) < 0.2;
        const isOpen = dist(indexTip, palmBase) > 0.4 && dist(middleTip, palmBase) > 0.4 && dist(pinkyTip, palmBase) > 0.4;
        const isPointing = dist(indexTip, palmBase) > 0.4 && dist(middleTip, palmBase) < 0.2 && dist(ringTip, palmBase) < 0.2;
        
        // Peace sign: Index and Middle are up, Ring and Pinky are down
        const isPeace = dist(indexTip, palmBase) > 0.4 && 
                        dist(middleTip, palmBase) > 0.4 && 
                        dist(ringTip, palmBase) < 0.25 && 
                        dist(pinkyTip, palmBase) < 0.25;
        
        // OK sign: Thumb and Index form a circle, other fingers extended
        const thumbIndexDist = dist(thumbTip, indexTip);
        const isOK = thumbIndexDist < 0.08 && 
                     dist(middleTip, palmBase) > 0.35 && 
                     dist(ringTip, palmBase) > 0.3 && 
                     dist(pinkyTip, palmBase) > 0.3;

        const currentX = palmBase.x;
        const currentY = palmBase.y;
        const deltaX = currentX - lastX.current;
        lastX.current = currentX;

        let detectedGesture: GestureState = 'idle';
        if (isOK) detectedGesture = 'ok';
        else if (isPeace) detectedGesture = 'peace';
        else if (isPointing) detectedGesture = 'pointing';
        else if (isFist) detectedGesture = 'gather';
        else if (isOpen) detectedGesture = 'scatter';
        
        if (detectedGesture === 'idle' || detectedGesture === 'scatter' || detectedGesture === 'gather') {
            if (deltaX > 0.015) detectedGesture = 'rotateLeft';
            else if (deltaX < -0.015) detectedGesture = 'rotateRight';
        }

        // Only update if gesture changed or position changed significantly
        const gestureChanged = detectedGesture !== lastGesture.current;
        const positionChanged = Math.abs(currentX - lastPalmX.current) > POSITION_THRESHOLD || 
                                Math.abs(currentY - lastPalmY.current) > POSITION_THRESHOLD;
        
        if (gestureChanged || positionChanged) {
          onGestureUpdate(detectedGesture, currentX, currentY);
          lastGesture.current = detectedGesture;
          lastPalmX.current = currentX;
          lastPalmY.current = currentY;
        }

        // Draw basic landmarks for feedback
        canvasCtx.fillStyle = '#00ff00';
        for (const landmark of landmarks) {
          canvasCtx.beginPath();
          canvasCtx.arc(landmark.x * canvasRef.current!.width, landmark.y * canvasRef.current!.height, 2, 0, 2 * Math.PI);
          canvasCtx.fill();
        }
      } else {
        // Only update if gesture was not idle before
        if (lastGesture.current !== 'idle') {
          onGestureUpdate('idle', 0.5, 0.5);
          lastGesture.current = 'idle';
          lastPalmX.current = 0.5;
          lastPalmY.current = 0.5;
        }
      }
      canvasCtx.restore();
    });

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current! });
      },
      width: 640,
      height: 480
    });
    camera.start();

    return () => {
      camera.stop();
      hands.close();
    };
  }, [onGestureUpdate]);

  return (
    <div className="relative w-full h-full">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="w-full h-full object-cover scale-x-[-1]" width={200} height={150} />
    </div>
  );
};

export default HandTracker;
