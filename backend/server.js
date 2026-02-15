import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./src/routes/auth.routes.js";
import routesRoutes from "./src/routes/routes.routes.js";
import activitiesRoutes from "./src/routes/activities.routes.js";
import nutritionRoutes from "./src/routes/nutrition.routes.js";
import reviewsRoutes from "./src/routes/reviews.routes.js";

dotenv.config();

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/routes", routesRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/reviews", reviewsRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "SportCommunity API funcionando 🚀",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      routes: "/api/routes",
      activities: "/api/activities",
      nutrition: "/api/nutrition",
      reviews: "/api/reviews"
    }
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, service: "sportcommunity-backend" });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
