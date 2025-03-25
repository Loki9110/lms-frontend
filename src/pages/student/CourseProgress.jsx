import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay, XCircle, Lock, Loader2 } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ReactPlayer from "react-player";
import PropTypes from "prop-types";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";

// Function to extract YouTube video ID without exposing the full URL
const getSecureVideoUrl = (youtubeUrl) => {
  try {
    // Extract ID from YouTube URLs
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
    const match = youtubeUrl.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    
    if (videoId) {
      // Return an embed URL (more secure than direct youtube.com links)
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
    return null;
  } catch (error) {
    console.error("Error processing YouTube URL:", error);
    return null;
  }
};

const SecureVideoPlayer = ({ url, onProgress, playerRef, autoPlay }) => {
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const playerContainerRef = useRef(null);
  const timelineRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playedPercent, setPlayedPercent] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playerHeight, setPlayerHeight] = useState(150); // Start with 150% height
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Handle right-click prevention
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    toast.error("Right-clicking is disabled for this video");
    return false;
  }, []);
  
  // Handle any attempt to access the iframe directly
  const handleMouseDown = useCallback((e) => {
    // Prevent default actions when clicking on the overlay
    if (e.target === overlayRef.current) {
      e.preventDefault();
    }
  }, []);

  // Handle play/pause toggle
  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.getInternalPlayer().pauseVideo();
      } else {
        playerRef.current.getInternalPlayer().playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Auto-hide controls after a period of inactivity
  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Hide controls after 3 seconds of inactivity when playing
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Show controls on user interaction
  const handlePlayerInteraction = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
      setPlayerHeight(100); // Set to 100% in fullscreen
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setPlayerHeight(150); // Set back to 150% when exiting fullscreen
    }
    
    setIsFullscreen(!isFullscreen);
  };

  // Reset the control visibility when playing state changes
  useEffect(() => {
    if (isPlaying) {
      showControlsTemporarily();
    } else {
      setControlsVisible(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [isPlaying, showControlsTemporarily]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenActive = 
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.msFullscreenElement;
      
      setIsFullscreen(!!fullscreenActive);
      setPlayerHeight(fullscreenActive ? 100 : 150); // Adjust height based on fullscreen state
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Calculate sections based on player height
  const getTopSectionHeight = () => {
    return isFullscreen ? '15%' : `${Math.round(0.2 * playerHeight)}%`;
  };

  const getMiddleSectionHeight = () => {
    return isFullscreen ? '70%' : `${Math.round(0.7 * playerHeight)}%`;
  };

  const getBottomSectionPosition = () => {
    return isFullscreen ? '85%' : `${Math.round(0.9 * playerHeight)}%`;
  };

  const getBottomSectionHeight = () => {
    return isFullscreen ? '15%' : `${Math.round(0.1 * playerHeight)}%`;
  };

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Handle timeline click or touch
  const handleTimelineInteraction = (e) => {
    if (!timelineRef.current) return;
    
    // Get position for both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (!clientX) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percent = Math.min(Math.max(offsetX / rect.width, 0), 1);
    
    if (playerRef.current) {
      // Move to the specific part of the video
      playerRef.current.seekTo(percent);
      setPlayedPercent(percent);
    }
  };

  // Handle seeking (dragging) state
  const handleSeekStart = (e) => {
    setSeeking(true);
    handleTimelineInteraction(e);
  };

  const handleSeekEnd = () => {
    setSeeking(false);
  };

  const handleSeekMove = (e) => {
    if (seeking) {
      handleTimelineInteraction(e);
    }
  };

  useEffect(() => {
    // Update playing state when autoPlay prop changes
    setIsPlaying(autoPlay);
  }, [autoPlay]);

  // Add document event listeners for dragging (both mouse and touch)
  useEffect(() => {
    if (seeking) {
      document.addEventListener('mousemove', handleSeekMove);
      document.addEventListener('mouseup', handleSeekEnd);
      document.addEventListener('touchmove', handleSeekMove, { passive: false });
      document.addEventListener('touchend', handleSeekEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleSeekMove);
        document.removeEventListener('mouseup', handleSeekEnd);
        document.removeEventListener('touchmove', handleSeekMove);
        document.removeEventListener('touchend', handleSeekEnd);
      };
    }
  }, [seeking]);

  useEffect(() => {
    // Apply right-click prevention to the container and to the iframe when it loads
    const container = containerRef.current;
    const playerContainer = playerContainerRef.current;
    
    if (container) {
      container.addEventListener('contextmenu', handleContextMenu);
      container.addEventListener('mousedown', handleMouseDown);
      
      // Find any iframes inside the player and disable right-click on them
      const preventRightClickOnIframes = () => {
        if (playerContainer) {
          const iframes = playerContainer.getElementsByTagName('iframe');
          for (let i = 0; i < iframes.length; i++) {
            iframes[i].addEventListener('contextmenu', handleContextMenu);
            // Also try to catch load events to re-apply
            iframes[i].addEventListener('load', () => {
              try {
                const iframeDocument = iframes[i].contentDocument || iframes[i].contentWindow.document;
                iframeDocument.addEventListener('contextmenu', handleContextMenu);
              } catch {
                // Ignore cross-origin restrictions
              }
            });
          }
        }
      };
      
      // Initial application
      preventRightClickOnIframes();
      
      // Set up a mutation observer to watch for iframe additions
      const observer = new MutationObserver(preventRightClickOnIframes);
      observer.observe(container, { childList: true, subtree: true });
      
      return () => {
        container.removeEventListener('contextmenu', handleContextMenu);
        container.removeEventListener('mousedown', handleMouseDown);
        observer.disconnect();
      };
    }
  }, [handleContextMenu, handleMouseDown]);

  const secureUrl = getSecureVideoUrl(url);

  // Custom progress handler to update our timeline
  const handleProgress = (state) => {
    if (!seeking) {
      setPlayedPercent(state.played);
    }
    onProgress(state);
    
    // Reset control visibility timer when video progresses
    if (isPlaying) {
      showControlsTemporarily();
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`aspect-video relative select-none ${isFullscreen ? 'bg-black' : ''}`}
      onContextMenu={handleContextMenu}
      onClick={handlePlayerInteraction}
      onMouseMove={handlePlayerInteraction}
      onTouchStart={handlePlayerInteraction}
    >
      {/* Top Black Section */}
      <div
        className="absolute top-0 left-0 w-full z-10 bg-black flex items-center justify-center"
        style={{ 
          height: getTopSectionHeight(),
          opacity: controlsVisible ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      >
        <div className="flex items-center text-white px-4">
          <Lock className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm md:text-base font-medium truncate">Secure Video Player</span>
        </div>
      </div>
      
      {/* Middle Transparent Section */}
      <div
        className="absolute z-10 bg-transparent flex flex-col items-center justify-center"
        style={{ 
          top: getTopSectionHeight(), 
          left: 0,
          width: '100%',
          height: getMiddleSectionHeight() 
        }}
      >
        {/* Center play button only shown when paused */}
        {!isPlaying && (
          <button 
            onClick={togglePlayPause}
            className="bg-black bg-opacity-50 rounded-full p-3 sm:p-4 md:p-5 hover:bg-opacity-70 transition-all absolute"
            aria-label="Play video"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        )}
      </div>
      
      {/* Bottom Black Section with timeline */}
      <div
        className="absolute left-0 w-full z-10 bg-black flex items-center justify-center"
        style={{ 
          top: getBottomSectionPosition(),
          height: getBottomSectionHeight(),
          opacity: controlsVisible ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      >
        {/* Video controls bar */}
        <div className="w-[90%] px-1 sm:px-2 py-1 sm:py-2 flex flex-col mb-1 sm:mb-2 md:mb-3">
          {/* Timeline */}
          <div 
            ref={timelineRef}
            className="w-full h-1.5 sm:h-2 bg-gray-600 rounded-full cursor-pointer relative mb-1 sm:mb-2"
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-white rounded-full"
              style={{ width: `${playedPercent * 100}%` }}
            />
            <div 
              className="absolute top-[-3px] h-[10px] w-[10px] sm:h-[12px] sm:w-[12px] bg-white rounded-full shadow-md"
              style={{ 
                left: `calc(${playedPercent * 100}% - 5px)`,
                display: seeking ? 'block' : 'none'
              }}
            />
          </div>
          
          {/* Controls row */}
          <div className="flex items-center justify-between">
            {/* Left side controls */}
            <div className="flex items-center">
              {/* Play/pause button */}
              <button 
                onClick={togglePlayPause}
                className="text-white mr-2 sm:mr-3 hover:text-gray-300 transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>
              
              {/* Time display */}
              <div className="text-white text-[8px] sm:text-xs">
                <span>{formatTime(duration * playedPercent)}</span>
                <span className="mx-0.5 sm:mx-1">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center">
              {/* Fullscreen toggle */}
              <button 
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={playerContainerRef} className="w-full h-full" onContextMenu={handleContextMenu}>
        <ReactPlayer
          ref={playerRef}
          url={secureUrl}
          width="100%"
          height={`${playerHeight}%`}
          controls={false}
          playing={isPlaying}
          onProgress={handleProgress}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onDuration={setDuration}
          config={{
            youtube: {
              playerVars: {
                rel: 0,            // Don't show related videos
                modestbranding: 1, // Minimal YouTube branding
                showinfo: 0,       // Hide video title and uploader
                fs: 1,             // Allow fullscreen
                cc_load_policy: 0, // Hide captions by default
                iv_load_policy: 3, // Hide annotations
                controls: 0,       // Hide YouTube controls
                playsinline: 1,    // Play inline on mobile devices
              },
            },
          }}
        />
      </div>
    </div>
  );
};

// Add prop validation to fix linter errors
SecureVideoPlayer.propTypes = {
  url: PropTypes.string.isRequired,
  onProgress: PropTypes.func.isRequired,
  playerRef: PropTypes.object.isRequired,
  autoPlay: PropTypes.bool.isRequired
};

const CourseProgress = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  
  // Get course access status to ensure the user has purchased the course
  const { data: courseAccessData, isLoading: accessLoading } = useGetCourseDetailWithStatusQuery(courseId);
  
  const playerRef = useRef(null);
  const { data, isLoading, refetch } = useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [completeCourse, { data: markCompleteData, isSuccess: completedSuccess }] = useCompleteCourseMutation();
  const [inCompleteCourse, { data: markInCompleteData, isSuccess: inCompletedSuccess }] = useInCompleteCourseMutation();
  const [currentLecture, setCurrentLecture] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);

  // Security check - redirect to payment page if user doesn't have access
  useEffect(() => {
    if (!accessLoading && courseAccessData) {
      // Only allow access if specifically purchased/approved by admin/instructor
      const hasApprovedAccess = courseAccessData.purchased === true;
      
      if (!hasApprovedAccess) {
        toast.error("You need instructor approval to access this course content");
        
        // Show a more prominent message before redirecting
        setTimeout(() => {
          navigate(`/payment-request/${courseId}`);
        }, 1500);
      }
    }
  }, [courseAccessData, accessLoading, courseId, navigate]);

  // Additional check for direct lecture URL access
  useEffect(() => {
    // If the course data is loaded and the path includes a lecture ID
    if (!accessLoading && courseAccessData && !courseAccessData.purchased && params.lectureId) {
      toast.error("Unauthorized access to course lecture");
      navigate(`/payment-request/${courseId}`);
    }
  }, [params.lectureId, accessLoading, courseAccessData, courseId, navigate]);

  useEffect(() => {
    if (completedSuccess) {
      refetch();
      toast.success(markCompleteData.message);
    }
    if (inCompletedSuccess) {
      refetch();
      toast.success(markInCompleteData.message);
    }
  }, [completedSuccess, inCompletedSuccess, markCompleteData, markInCompleteData, refetch]);

  // Disable right-click on the entire page when on the course progress route
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Show loading state when checking access
  if (accessLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2">Verifying course access...</p>
        </div>
      </div>
    );
  }

  // Skip rendering content if user has no access (will redirect in useEffect)
  if (!courseAccessData?.purchased) {
    return null;
  }

  if (isLoading) return <p>Loading...</p>;

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle } = courseDetails;

  // initialize the first lecture if not exist
  const initialLecture = courseDetails.lectures && courseDetails.lectures[0];

  const isLectureCompleted = (lectureId) => {
    return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
  };

  const calculateProgress = () => {
    if (!courseDetails.lectures || courseDetails.lectures.length === 0) return 0;
    const completedLectures = courseDetails.lectures.filter(lecture => 
      isLectureCompleted(lecture._id)
    ).length;
    return Math.round((completedLectures / courseDetails.lectures.length) * 100);
  };

  const handleLectureProgress = async (lectureId, isCompleting = true) => {
    try {
      const response = await updateLectureProgress({
        courseId,
        lectureId,
        isCompleting
      }).unwrap();
      
      if (response) {
        await refetch();
        toast.success(isCompleting ? "Lecture marked as completed" : "Lecture marked as uncompleted");
      }
    } catch (error) {
      console.error('Error updating lecture progress:', error);
      toast.error(error.data?.message || "Failed to update lecture progress");
    }
  };

  // Handle select a specific lecture to watch
  const handleSelectLecture = (lecture) => {
    // Stop current video playback
    if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
    
    setCurrentLecture(lecture);
    // Enable autoplay when selecting a lecture
    setAutoPlay(true);
  };

  const handleVideoProgress = (state) => {
    // If video is 95% complete, mark it as viewed
    if (state.played >= 0.95 && currentLecture) {
      const lectureId = currentLecture._id || initialLecture?._id;
      if (lectureId) {
        handleLectureProgress(lectureId, true);
      }
    }
  };

  const handleCompleteCourse = async () => {
    try {
      await completeCourse(courseId).unwrap();
    } catch (error) {
      console.error('Error completing course:', error);
      toast.error(error.data?.message || "Failed to update course status");
    }
  };

  const handleInCompleteCourse = async () => {
    try {
      await inCompleteCourse(courseId).unwrap();
    } catch (error) {
      console.error('Error marking course as incomplete:', error);
      toast.error(error.data?.message || "Failed to update course status");
    }
  };

  const progressPercentage = calculateProgress();

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Course Progress Bar */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{courseTitle}</h1>
          <Button
            onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
            variant={completed ? "outline" : "default"}
          >
            {completed ? (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" /> <span>Completed</span>
              </div>
            ) : (
              "Mark as completed"
            )}
          </Button>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Course Progress</span>
            <span>{progressPercentage}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Video section  */}
        <div className="flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4 select-none">
          <SecureVideoPlayer
            url={currentLecture?.youtubeUrl || initialLecture?.youtubeUrl}
            playerRef={playerRef}
            onProgress={handleVideoProgress}
            autoPlay={autoPlay}
          />
          
          {/* Display current watching lecture title and completion button */}
          <div className="mt-4 flex justify-between items-center">
            <h3 className="font-medium text-lg">
              {`Lecture ${
                currentLecture ? courseDetails.lectures.findIndex(lec => lec._id === currentLecture._id) + 1 : 1
              } : ${currentLecture?.lectureTitle || initialLecture?.lectureTitle}`}
            </h3>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => handleLectureProgress(
                  currentLecture?._id || initialLecture?._id,
                  !isLectureCompleted(currentLecture?._id || initialLecture?._id)
                )}
                className={isLectureCompleted(currentLecture?._id || initialLecture?._id) ? 
                  "text-yellow-600 hover:text-yellow-700" : 
                  "text-green-600 hover:text-green-700"
                }
              >
                {isLectureCompleted(currentLecture?._id || initialLecture?._id) ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Mark as Uncomplete
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Lecture Sidebar  */}
        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
          <h2 className="font-semibold text-xl mb-4">Course Lectures</h2>
          <div className="flex-1 overflow-y-auto">
            {courseDetails?.lectures.map((lecture, index) => (
              <Card
                key={lecture._id}
                className={`mb-3 hover:cursor-pointer transition transform ${
                  index === courseDetails.lectures.findIndex(lec => lec._id === currentLecture?._id)
                    ? "bg-gray-100 dark:bg-gray-800"
                    : ""
                }`}
                onClick={() => handleSelectLecture(lecture)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    {isLectureCompleted(lecture._id) ? (
                      <CheckCircle2 size={24} className="text-green-500 mr-2" />
                    ) : (
                      <CirclePlay size={24} className="text-gray-500 mr-2" />
                    )}
                    <div>
                      <CardTitle className="text-lg font-medium">
                        {lecture.lectureTitle}
                      </CardTitle>
                    </div>
                  </div>
                  {isLectureCompleted(lecture._id) && (
                    <Badge variant="outline" className="bg-green-200 text-green-600">
                      Completed
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;

