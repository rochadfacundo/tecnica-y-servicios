/* eslint-disable new-cap */
// routes/user.routes.ts
import { Router } from "express";
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  getTodosLosUsuarios,
  getUsuarioPorId,
} from "../controller/user.controller";


const router = Router();

// Solo un administrador puede crear usuarios
router.post("/", crearUsuario);
router.put("/:uid", actualizarUsuario);
router.delete("/:uid", eliminarUsuario);

router.get("/", getTodosLosUsuarios);
router.get("/:uid", getUsuarioPorId);

export default router;
