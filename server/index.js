import express from "express";
import dotenv from "dotenv";
import connectDB from "../server/lib/db.js";
import userRoute from "../server/routes/user.route.js";
import authRoute from "../server/routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import courseRoute from "../server/routes/course.route.js"
import mediaRoute from "../server/routes/media.route.js"
import enrollCourse from "../server/routes/enrollCourse.route.js"
import courseProgressRoute from "../server/routes/courseProgress.route.js"
import adminRoute from "../server/routes/admin.route.js";
import chatRoute from "../server/routes/chat.route.js"
import quizRoute from "../server/routes/quiz.route.js"
import questionRoute from "../server/routes/question.route.js"
import lectureRoute from "../server/routes/lecture.route.js"
import lessonRoute from "../server/routes/lesson.route.js"
import captionRoute from './routes/caption.route.js';
import categoryRoute from "../server/routes/category.routes.js"
import path from "path";

dotenv.config({});

//call database connection here 
connectDB();
const app = express();
const PORT = process.env.PORT || 8080;

//default middleware 
app.use(express.json());
app.use(cookieParser());

// Updated CORS configuration - includes both dev and preview ports
app.use(cors({
  origin: [
    "http://localhost:5173",  // Dev server
    "http://localhost:4173",  // Preview server
    "http://localhost:3000",  // Alternative dev port
    "http://170.64.236.0", 
  ],
  credentials: true
}));

//api's
app.use("/api/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/courses", courseRoute);
app.use("/api/v1/lectures", lectureRoute);
app.use("/api/v1/lessons", lessonRoute);
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/enroll", enrollCourse);
app.use("/api/v1/quiz", quizRoute);
app.use("/api/v1/question", questionRoute)
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/categories", categoryRoute)
app.use('/api', captionRoute);
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads')));

app.listen(PORT,'0.0.0.0', () => {
  console.log(`server listening at port ${PORT}`);
})
