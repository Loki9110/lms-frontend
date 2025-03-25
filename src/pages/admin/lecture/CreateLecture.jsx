import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateLectureMutation,
  useRemoveLectureMutation,
  useGetCourseByIdQuery,
  usePublishCourseMutation
} from "@/features/api/courseApi";
import { Loader2, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const CreateLecture = () => {
  const navigate = useNavigate();
  const params = useParams();
  const courseId = params.courseId;

  console.log("CreateLecture rendered with courseId:", courseId);

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Query for course details with refetch capability
  const { data: courseData, isLoading: isCourseLoading, refetch: refetchCourse, error } = useGetCourseByIdQuery(courseId);
  const [createLecture, { isLoading }] = useCreateLectureMutation();
  const [removeLecture, { isLoading: isRemoving }] = useRemoveLectureMutation();
  const [publishCourse, { isLoading: isPublishing }] = usePublishCourseMutation();

  // Make sure to access course data safely
  const course = courseData?.course || {};
  const lectures = course?.lectures || [];

  // Check if courseId exists
  useEffect(() => {
    if (!courseId) {
      console.error("No courseId found in URL parameters");
      toast.error("Course ID not found");
      navigate("/admin/course");
      return;
    }
    
    console.log("Attempting to fetch course with ID:", courseId);
  }, [courseId, navigate]);

  // Fetch fresh course data when component mounts
  useEffect(() => {
    if (courseId) {
      refetchCourse().catch(err => {
        console.error("Failed to refetch course:", err);
      });
    }
    
    // For debugging
    if (courseData) {
      console.log('Course data loaded successfully:', courseData);
    }
    
    if (error) {
      console.error('Error fetching course:', error);
      if (error.status === 404) {
        toast.error("Course not found");
      } else {
        toast.error("Failed to load course data");
      }
    }
  }, [refetchCourse, courseId, error]);

  // Update state whenever course data changes
  useEffect(() => {
    if (courseData?.course) {
      console.log("Course publish status:", courseData.course.isPublished);
    }
  }, [courseData]);

  // Add an effect to update the local state when the course data changes
  useEffect(() => {
    if (courseData?.course) {
      console.log("Course publish status updated:", courseData.course.isPublished);
    }
  }, [courseData?.course?.isPublished]);

  // Validate YouTube URL
  const isValidYouTubeUrl = (url) => {
    // This regex handles both youtube.com and youtu.be formats
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
    return youtubeRegex.test(url);
  };

  const extractVideoId = (url) => {
    if (!url) return '';
    
    // Extract video ID from youtube.com URL
    let match = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
    
    // Extract video ID from youtu.be URL
    match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
    
    return '';
  };

  const handleLectureSubmit = async () => {
    if (!title.trim()) {
      return toast.error("Lecture title is required");
    }

    if (!videoUrl.trim()) {
      return toast.error("Video URL is required");
    }

    if (!isValidYouTubeUrl(videoUrl)) {
      return toast.error("Please enter a valid YouTube URL (format: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)");
    }

    try {
      // Convert youtu.be URL to standard format if needed
      const videoId = extractVideoId(videoUrl);
      const standardVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      const result = await createLecture({
        courseId,
        title,
        description: title, // Using title as description for now
        videoUrl: standardVideoUrl,
      }).unwrap();

      if (result.success) {
        toast.success("Lecture created successfully");
        setTitle("");
        setVideoUrl("");
        // Refetch course to update the lectures list
        refetchCourse();
      } else {
        toast.error(result.message || "Failed to create lecture");
      }
    } catch (error) {
      console.error("Error creating lecture:", error);
      toast.error(error?.data?.message || "Failed to create lecture. Please try again.");
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    const confirmed = window.confirm("Are you sure you want to delete this lecture?");
    if (!confirmed) return;

    try {
      const result = await removeLecture({ courseId, lectureId }).unwrap();
      if (result.success) {
        toast.success("Lecture removed successfully");
        // Refetch course to update the lectures list
        refetchCourse();
      } else {
        toast.error(result.message || "Failed to remove lecture");
      }
    } catch (error) {
      console.error("Error removing lecture:", error);
      toast.error(error?.data?.message || "Failed to remove lecture. Please try again.");
    }
  };

  const handlePublishToggle = async () => {
    // Check if there are lectures before attempting to publish
    if (!course.isPublished && (!lectures || lectures.length === 0)) {
      return toast.error("Please add at least one lecture before publishing the course");
    }
    
    // Toggle current status - convert boolean to string
    const newStatus = !course.isPublished ? "true" : "false";
    
    // Display a loading toast
    const toastId = toast.loading(`${newStatus === "true" ? "Publishing" : "Unpublishing"} course...`);
    
    try {
      console.log("Sending publish request with:", { courseId, status: newStatus });
      
      await publishCourse({
        courseId,
        status: newStatus
      }).unwrap();
      
      // Dismiss loading toast and show success
      toast.dismiss(toastId);
      toast.success(`Course ${newStatus === "true" ? "published" : "unpublished"} successfully`);
      
      // Force refetch course data to update the UI
      await refetchCourse();
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(toastId);
      console.error("Publish error:", error);
      toast.error(error.data?.message || "Failed to update course status. Please try again.");
    }
  };

  if (isCourseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading course details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl text-red-600">Error loading course</h2>
        <p className="text-gray-500 mb-4">{error?.data?.message || "Failed to load course details"}</p>
        <Button onClick={() => navigate("/admin/course")} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (!courseData?.course) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl text-red-600">Course not found</h2>
        <Button onClick={() => navigate("/admin/course")} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">{course.courseTitle || "Course"}</h1>
          <p className="text-gray-500">{course.subTitle || ""}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/course/edit/${courseId}`)}
          >
            Back to Course Details
          </Button>
          <Button 
            variant={course.isPublished ? "destructive" : "default"}
            onClick={handlePublishToggle}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              course.isPublished ? "Unpublish Course" : "Publish Course"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Add New Lecture</h2>
          <div className="space-y-4">
            <div>
              <Label>Lecture Title</Label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter lecture title"
              />
            </div>
            <div>
              <Label>YouTube Video URL</Label>
              <Input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID"
              />
              <p className="text-sm text-gray-500 mt-1">
                Formats: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
              </p>
            </div>
            <Button 
              disabled={isLoading} 
              onClick={handleLectureSubmit}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Lecture...
                </>
              ) : (
                "Add Lecture"
              )}
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">
            Course Lectures ({lectures.length || 0})
          </h2>
          {lectures.length > 0 ? (
            <div className="space-y-3">
              {lectures.map((lecture, index) => (
                <div
                  key={lecture._id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                >
                  <div>
                    <span className="font-medium">
                      {index + 1}. {lecture.lectureTitle || "Untitled"}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isRemoving}
                    onClick={() => handleDeleteLecture(lecture._id)}
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No lectures added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateLecture;
