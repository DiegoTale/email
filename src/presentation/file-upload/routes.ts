import { Router } from "express";

import { AuthMiddleware } from "../middlewares/auth.middleware";
import { CategoryService } from "../services/category.service";
import { FileUploadController } from "./controller";
import { FileUploadService } from "../services/file-upload.service";

export class FileUploadRoutes {
  static get routes(): Router {
    const router = Router();
    // const fileuploadService = new FileUploadService();

    const controller = new FileUploadController(new FileUploadService());

    // Definir las rutas

    // api/upload/single/<user|category|product>/
    // api/upload/multiple/<user|category|product>/
    router.get("/single/:type", controller.uploadFile);
    router.get("/multiple/:type", controller.uploadMultipleFiles);

    return router;
  }
}
