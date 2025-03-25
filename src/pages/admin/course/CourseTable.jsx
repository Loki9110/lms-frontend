import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { Pencil, RefreshCcw, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

// Add this CSS animation at the top of your file or in your styles
const pulseAnimation = `
  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
    }
    
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
    }
    
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
    }
  }
`;

const CourseTable = () => {
  const { data, isLoading, refetch } = useGetCreatorCourseQuery();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Log data for debugging
  useEffect(() => {
    console.log("CourseTable - data received:", data);
  }, [data]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      console.log("CourseTable - manual refresh triggered");
    } catch (error) {
      toast.error("Failed to refresh courses");
      console.error("CourseTable - refresh error:", error);
    } finally {
      // Ensure minimum loading state of 1s
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const filteredCourses = useMemo(() => {
    return data?.courses?.filter(course => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        course.courseTitle.toLowerCase().includes(searchLower) ||
        course.creator?.name?.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === "all" || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];
  }, [data?.courses, searchTerm, statusFilter]);

  const TableSkeleton = () => (
    <TableRow>
      <TableCell className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-8"></div>
      </TableCell>
      <TableCell className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </TableCell>
      <TableCell className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </TableCell>
      <TableCell className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </TableCell>
      <TableCell className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </TableCell>
      <TableCell className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </TableCell>
    </TableRow>
  );

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Loading courses...</span>
    </div>
  );

  return (
    <>
      <style>{pulseAnimation}</style>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">All Courses</h2>
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh} 
              variant="outline"
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate(`create`)}>Create a new course</Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by course title or creator name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Live</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableCaption>A list of your courses and their live/draft status.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">S.No</TableHead>
              <TableHead>Course Title</TableHead>
              <TableHead>Creator/Lecturer</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isRefreshing ? (
              Array(5).fill(0).map((_, idx) => <TableSkeleton key={idx} />)
            ) : filteredCourses?.map((course, index) => (
              <TableRow key={course._id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{course.courseTitle}</TableCell>
                <TableCell>{course.creator?.name || 'Unknown Creator'}</TableCell>
                <TableCell>
                  {!course.coursePrice || course.coursePrice === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span>₹{course.coursePrice}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`${
                      course.status === 'active' 
                        ? "bg-green-100 text-green-800 hover:bg-green-200 w-[70px] justify-center inline-flex" 
                        : "bg-orange-100 text-orange-800 hover:bg-orange-200 w-[70px] justify-center inline-flex"
                    }`}
                  >
                    {course.status === 'active' ? "Live" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-2 hover:text-blue-600"
                    onClick={() => navigate(`edit/${course._id}`)}
                  >
                    <Pencil size={16} />
                    Edit Course
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {data?.courses.length === 0 && !searchTerm && statusFilter === "all" && (
          <div className="text-center py-8">
            <p className="text-gray-500">No courses created yet.</p>
            <Button 
              onClick={() => navigate('create')} 
              className="mt-4"
            >
              Create your first course
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CourseTable;
