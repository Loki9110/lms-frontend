import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plus, Trash2, GripVertical, Youtube } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { Label } from './ui/label';

const LectureManager = ({ lectures = [], onLecturesChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newLecture, setNewLecture] = useState({
    lectureTitle: "",
    videoUrl: "",
  });

  const handleAddLecture = () => {
    if (!newLecture.lectureTitle || !newLecture.videoUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate YouTube URL
    const videoId = extractYouTubeId(newLecture.videoUrl);
    if (!videoId) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    // Standardize YouTube URL
    const standardVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const lectureToAdd = {
      // Only include _id if it's an existing lecture
      title: newLecture.lectureTitle.trim(),
      lectureTitle: newLecture.lectureTitle.trim(), // Keep both for compatibility
      description: newLecture.lectureTitle.trim(), // Use title as default description
      lectureDescription: newLecture.lectureTitle.trim(), // Keep both for compatibility
      videoUrl: standardVideoUrl,
      order: lectures.length,
      duration: 0, // Default duration
      isNew: true // Flag to identify new lectures
    };

    // Add the new lecture and update order numbers
    const updatedLectures = [...lectures, lectureToAdd].map((lecture, index) => ({
      ...lecture,
      order: index
    }));

    onLecturesChange(updatedLectures);
    setIsAdding(false);
    setNewLecture({
      lectureTitle: "",
      videoUrl: "",
    });
    toast.success("Lecture added successfully");
  };

  const handleDeleteLecture = (lectureId) => {
    const updatedLectures = lectures.filter((lecture) => lecture._id !== lectureId)
      .map((lecture, index) => ({
        ...lecture,
        order: index
      }));
    onLecturesChange(updatedLectures);
    toast.success("Lecture deleted successfully");
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(lectures);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    onLecturesChange(updatedItems);
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Course Lectures</h3>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lecture
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Lecture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lectureTitle">Lecture Title *</Label>
              <Input
                id="lectureTitle"
                value={newLecture.lectureTitle}
                onChange={(e) =>
                  setNewLecture({ ...newLecture, lectureTitle: e.target.value })
                }
                placeholder="Enter lecture title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">YouTube Video URL *</Label>
              <div className="flex gap-2">
                <Input
                  id="videoUrl"
                  value={newLecture.videoUrl}
                  onChange={(e) =>
                    setNewLecture({ ...newLecture, videoUrl: e.target.value })
                  }
                  placeholder="Enter YouTube video URL"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const videoId = extractYouTubeId(newLecture.videoUrl);
                    if (videoId) {
                      window.open(
                        `https://www.youtube.com/watch?v=${videoId}`,
                        "_blank"
                      );
                    } else {
                      toast.error("Invalid YouTube URL");
                    }
                  }}
                >
                  <Youtube className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewLecture({
                    lectureTitle: "",
                    videoUrl: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddLecture}>Add Lecture</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="lectures">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {lectures.map((lecture, index) => (
                <Draggable
                  key={lecture._id}
                  draggableId={lecture._id}
                  index={index}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="group bg-white hover:bg-gray-50 transition-colors"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-move"
                          >
                            <GripVertical className="h-5 w-5 text-gray-400" />
                          </div>
                          <h4 className="font-medium flex-1">
                            {lecture.title || lecture.lectureTitle}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteLecture(lecture._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

LectureManager.propTypes = {
  lectures: PropTypes.array,
  onLecturesChange: PropTypes.func.isRequired
};

export default LectureManager; 