import { Router } from "express";
import { FileUploadController } from "./controller";
import { FileUploadService } from "../services/file-upload.service";
import { FileUploadMiddleware } from "../middlewares/file-upload.middleware";
import { TypMiddleware } from "../middlewares/type.middleware";

export class FileUploadRoutes {
  static get routes(): Router {
    const router = Router();
    // const fileuploadService = new FileUploadService();

    const controller = new FileUploadController(new FileUploadService());

    // Definir las rutas
    router.use(FileUploadMiddleware.containFiles);
    router.use(TypMiddleware.validTypes(["users", "products", "categories"]));
    // api/upload/single/<user|category|product>/
    // api/upload/multiple/<user|category|product>/
    router.post("/single/:type", controller.uploadFile);
    router.post("/multiple/:type", controller.uploadMultipleFiles);

    return router;
  }
}
