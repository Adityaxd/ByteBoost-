'use client';

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

export default function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
          src: videoUrl,
          type: 'video/mp4'
        }],
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        controlBar: {
          playToggle: true,
          volumePanel: {
            inline: false,
          },
          currentTimeDisplay: true,
          timeDivider: true,
          durationDisplay: true,
          progressControl: true,
          remainingTimeDisplay: false,
          fullscreenToggle: true,
          playbackRateMenuButton: {
            playbackRates: [0.5, 1, 1.25, 1.5, 2]
          },
        }
      });

      player.on('ready', () => {
        console.log('Player is ready');
      });
    }

    // Update source when videoUrl changes
    if (playerRef.current && videoUrl) {
      playerRef.current.src({
        src: videoUrl,
        type: 'video/mp4'
      });
    }
  }, [videoUrl]);

  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <div data-vjs-player>
        <div ref={videoRef} />
      </div>
    </div>
  );
}