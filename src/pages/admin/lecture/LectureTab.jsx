import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation } from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isFree, setIsFree] = useState(false);
  const params = useParams();
  const { courseId, lectureId } = params;

  const {data:lectureData} = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  useEffect(()=>{
    if(lecture){
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree);
      setYoutubeUrl(lecture.youtubeUrl);
    }
  },[lecture])

  const [editLecture, { data, isLoading, error, isSuccess }] = useEditLectureMutation();
  const [removeLecture,{data:removeData, isLoading:removeLoading, isSuccess:removeSuccess}] = useRemoveLectureMutation();

  const validateYoutubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const editLectureHandler = async () => {
    if (!validateYoutubeUrl(youtubeUrl)) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    await editLecture({
      lectureTitle,
      youtubeUrl,
      isPreviewFree: isFree,
      courseId,
      lectureId,
    });
  };

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);

  useEffect(()=>{
    if(removeSuccess){
      toast.success(removeData.message);
    }
  },[removeSuccess])

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button disabled={removeLoading} variant="destructive" onClick={removeLectureHandler}>
            {
              removeLoading ? <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
              Please wait
              </> : "Remove Lecture"
            }
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={lectureTitle}
              onChange={(e) => setLectureTitle(e.target.value)}
              type="text"
              placeholder="Ex. Introduction to Javascript"
            />
          </div>
          <div>
            <Label>YouTube URL <span className="text-red-500">*</span></Label>
            <Input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              type="url"
              placeholder="Ex. https://youtube.com/watch?v=..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={isFree} onCheckedChange={setIsFree} id="preview-mode" />
            <Label htmlFor="preview-mode">Make this video FREE preview</Label>
          </div>

          <Button 
            onClick={editLectureHandler} 
            disabled={isLoading || !lectureTitle || !youtubeUrl}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                Saving changes...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;
