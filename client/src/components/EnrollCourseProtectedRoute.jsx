import { useGetCourseDetailWithStatusQuery } from "@/features/api/enrollApi";
import { Navigate, useParams } from "react-router-dom";

const EnrollCourseProtectedRoute = ({children}) => {
  const {courseId} = useParams();
  const {data, isLoading} = useGetCourseDetailWithStatusQuery(courseId);

  if(isLoading) return <p>Loading</p>

  return data?.enrolled ? children : <Navigate to={`/course-detail/${courseId}`}/>
}

export default EnrollCourseProtectedRoute;