/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Request, Response } from "express";
import * as admin from "firebase-admin";
import { RegisterUserDTO } from "./interfaces/userDTO";

export const crearUsuario = async (
  req: Request<{}, {}, RegisterUserDTO>,
  res: Response
) => {
  const { nombre, apellido, email, password, role } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    await admin.firestore().collection("usuarios").doc(userRecord.uid).set({
      nombre,
      apellido,
      email,
      role,
      creadoEn: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ uid: userRecord.uid });
  } catch (error: any) {
    console.error("❌ Error creando usuario:", error);
    res.status(500).json({ error: error.message || "Error al crear usuario" });
  }
};
