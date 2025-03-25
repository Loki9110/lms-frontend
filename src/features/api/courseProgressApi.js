import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// Use relative URL to leverage the Vite proxy configuration
const COURSE_PROGRESS_API = "/api/v1/progress";

export const courseProgressApi = createApi({
  reducerPath: "courseProgressApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PROGRESS_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getCourseProgress: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
    }),
    updateLectureProgress: builder.mutation({
      query: ({ courseId, lectureId, isCompleting }) => ({
        url: `/${courseId}/lecture/${lectureId}/view`,
        method: "POST",
        body: { viewed: isCompleting }
      }),
      invalidatesTags: ["Course_Progress"],
    }),

    completeCourse: builder.mutation({
      query:(courseId) => ({
        url:`/${courseId}/complete`,
        method:"POST"
      }),
      transformErrorResponse: (response) => {
        console.log('Complete course error:', response);
        if (response?.status === 404) {
          return {
            status: response.status,
            data: {
              message: "Course progress not found. Please view at least one lecture first.",
              originalError: response.data
            }
          };
        }
        if (response?.status === 500) {
          return {
            status: response.status,
            data: {
              message: "Failed to update course status. Please try again.",
              originalError: response.data
            }
          };
        }
        return response;
      }
    }),
    inCompleteCourse: builder.mutation({
      query:(courseId) => ({
        url:`/${courseId}/incomplete`,
        method:"POST"
      }),
      transformErrorResponse: (response) => {
        console.log('Incomplete course error:', response);
        if (response?.status === 404) {
          return {
            status: response.status,
            data: {
              message: "Course progress not found. Please view at least one lecture first.",
              originalError: response.data
            }
          };
        }
        if (response?.status === 500) {
          return {
            status: response.status,
            data: {
              message: "Failed to update course status. Please try again.",
              originalError: response.data
            }
          };
        }
        return response;
      }
    }),
    
  }),
});
export const {
useGetCourseProgressQuery,
useUpdateLectureProgressMutation,
useCompleteCourseMutation,
useInCompleteCourseMutation
} = courseProgressApi;
