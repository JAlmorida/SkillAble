import express from "express";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";
import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import courseRoute from "./routes/course.route.js"
import mediaRoute from "./routes/media.route.js"
import enrollCourse from "./routes/enrollCourse.route.js"
import courseProgressRoute from "./routes/courseProgress.route.js"
import adminRoute from "./routes/admin.route.js";

dotenv.config({});

//call database connection here 
connectDB();
const app = express();
const PORT = process.env.PORT || 8080;

//default middleware 
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}));
//api's
app.use("/api/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/enroll", enrollCourse)
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/admin", adminRoute);

app.listen(PORT, () =>{
  console.log(`server listening at port ${PORT}`);
})
