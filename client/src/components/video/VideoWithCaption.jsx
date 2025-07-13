import React, { useEffect, useState, useRef } from 'react';
import { useGetCaptionQuery, useGenerateCaptionMutation } from '@/features/api/captionApi';
import { useResize } from '../context/ResizeContext';

const POLL_INTERVAL = 3000;

const VideoWithCaption = ({ videoUrl }) => {
  const { currentScaleValue } = useResize();
  const [generateCaption] = useGenerateCaptionMutation();
  const [shouldPoll, setShouldPoll] = useState(false);
  const pollRef = useRef(null);

  const {
    data,
    isLoading,
    error,
    refetch,
    isError,
  } = useGetCaptionQuery(videoUrl, { skip: !videoUrl });

  useEffect(() => {
    if (videoUrl && isError && error?.status === 404) {
      generateCaption(videoUrl);
      setShouldPoll(true);
    }
  }, [videoUrl, isError, error, generateCaption]);

  useEffect(() => {
    if (data?.status === 'processing' || shouldPoll) {
      if (!pollRef.current) {
        pollRef.current = setInterval(() => {
          refetch();
        }, POLL_INTERVAL);
      }
    } else if (data?.status === 'completed' || data?.text) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
        setShouldPoll(false);
      }
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [data, shouldPoll, refetch]);

  if (!videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] bg-white dark:bg-zinc-900 rounded-xl shadow">
        <span className="text-gray-400 dark:text-gray-500 text-lg">No video available.</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg flex flex-col gap-6">
      {/* Video */}
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
        <video
          controls
          src={videoUrl}
          className="w-full h-full object-contain rounded-xl"
          style={{ borderRadius: 16 }}
        />
      </div>
      {/* Caption Status/Content */}
      <div className="w-full">
        {(isLoading || data?.status === 'processing' || shouldPoll) && (
          <div className="flex items-center justify-center gap-2 text-blue-500 dark:text-blue-400 text-sm font-medium py-4">
            <svg className="animate-spin h-5 w-5 mr-2 text-blue-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Generating caption, please wait...
          </div>
        )}
        {data?.text && (
          <div
            className="bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 p-4 rounded-xl shadow-inner text-center text-base max-h-40 overflow-y-auto transition-all"
            style={{ fontSize: `${1.125 * currentScaleValue}rem` }}
          >
            <strong className="block mb-2 text-blue-600 dark:text-blue-400 text-base">Caption</strong>
            <div>{data.text}</div>
          </div>
        )}
        {isError && error?.status !== 404 && (
          <div className="text-red-500 text-center text-sm mt-2">Error loading caption.</div>
        )}
      </div>
    </div>
  );
};

export default VideoWithCaption;
