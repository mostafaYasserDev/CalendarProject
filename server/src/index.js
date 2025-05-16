import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import specialDayRoutes from "./routes/specialDayRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
console.log("🚀 Server starting...");

config();

connectDB();

const app = express();

app.use(
  cors({
    origin: [
      "https://calendar-project.vercel.app/",
      "https://calendar-project-mostafa-yassers-projects.vercel.app/",
      "https://calendar-project-git-main-mostafa-yassers-projects.vercel.app/",
      "https://calendar-project-3tyvxukrr-mostafa-yassers-projects.vercel.app/",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/special-days", specialDayRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Calendar API" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection:", err);
});
