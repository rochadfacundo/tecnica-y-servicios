/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import * as admin from "firebase-admin";
import { Productor } from "../interfaces/productor";

// Crear usuario
export const crearUsuario = async (
  req: Request<{}, {}, Productor>,
  res: Response
) => {
  const { nombre, apellido, email, password, role, companias } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    const nuevoProductor: Productor = {
      nombre,
      apellido,
      email,
      role,
      companias,
      creadoEn: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection("usuarios").doc(userRecord.uid).set(nuevoProductor);

    res.status(201).json({ uid: userRecord.uid });
  } catch (error: any) {
    console.error("❌ Error creando usuario:", error);
    res.status(500).json({ error: error.message || "Error al crear usuario" });
  }
};


// Actualizar usuario
export const actualizarUsuario = async (
  req: Request<{ uid: string }, {}, Productor>,
  res: Response
) => {
  const { uid } = req.params;
  const { nombre, apellido, email, role } = req.body;

  try {
    // 🔧 Solo los campos necesarios para Firestore
    const dataToUpdate = {
      nombre,
      apellido,
      email,
      role,
      actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection("usuarios").doc(uid).update(dataToUpdate);
    await admin.auth().updateUser(uid, { email });

    res.status(200).json({ message: "✅ Usuario actualizado correctamente" });
  } catch (error: any) {
    console.error("❌ Error actualizando usuario:", error);
    res.status(500).json({ error: error.message || "Error al actualizar usuario" });
  }
};

// Eliminar usuario
export const eliminarUsuario = async (
  req: Request<{ uid: string }>,
  res: Response
) => {
  const { uid } = req.params;

  try {
    // ✅ 1. Eliminar de Firestore
    await admin.firestore().collection("usuarios").doc(uid).delete();

    // ✅ 2. Eliminar de Firebase Auth
    await admin.auth().deleteUser(uid);

    res.status(200).json({ message: "✅ Usuario eliminado correctamente" });
  } catch (error: any) {
    console.error("❌ Error eliminando usuario:", error);
    res.status(500).json({ error: error.message || "Error al eliminar usuario" });
  }
};

// Obtener todos los usuarios
export const getTodosLosUsuarios = async (_req: Request, res: Response) => {
  try {
    const snapshot = await admin.firestore().collection("usuarios").get();
    const usuarios = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(usuarios);
  } catch (error: any) {
    console.error("❌ Error obteniendo usuarios:", error);
    res.status(500).json({ error: error.message || "Error al obtener usuarios" });
  }
};

// Obtener un usuario por ID
export const getUsuarioPorId = async (
  req: Request<{ uid: string }>,
  res: Response
): Promise<void> => {
  const { uid } = req.params;

  try {
    const doc = await admin.firestore().collection("usuarios").doc(uid).get();

    if (!doc.exists) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.status(200).json({ uid: doc.id, ...doc.data() });
  } catch (error: any) {
    console.error("❌ Error obteniendo usuario por ID:", error);
    res.status(500).json({ error: error.message || "Error al obtener usuario" });
  }
};

