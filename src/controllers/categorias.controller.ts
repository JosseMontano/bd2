import { NextFunction, Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { Categoria } from '../types/models';

function getId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function categoryValues(req: Request): { nombre: string; descripcion: string } {
  return {
    nombre: String(req.body.nombre ?? '').trim(),
    descripcion: String(req.body.descripcion ?? '').trim()
  };
}

export async function listarCategorias(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [categorias] = await pool.query<Categoria[]>(
      'SELECT * FROM categorias ORDER BY nombre ASC'
    );
    res.render('categorias/index', {
      title: 'Categorías',
      categorias,
      message: req.query.message,
      error: req.query.error
    });
  } catch (error) {
    next(error);
  }
}

export function mostrarCrearCategoria(_req: Request, res: Response): void {
  res.render('categorias/form', {
    title: 'Nueva categoría',
    categoria: null,
    action: '/categorias',
    submitLabel: 'Crear categoría',
    error: null
  });
}

export async function crearCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
  const values = categoryValues(req);
  if (!values.nombre) {
    res.status(422).render('categorias/form', {
      title: 'Nueva categoría',
      categoria: values,
      action: '/categorias',
      submitLabel: 'Crear categoría',
      error: 'El nombre es obligatorio.'
    });
    return;
  }

  try {
    await pool.execute<ResultSetHeader>(
      'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
      [values.nombre, values.descripcion || null]
    );
    res.redirect('/categorias?message=Categoría creada correctamente');
  } catch (error) {
    if (isDuplicateEntry(error)) {
      res.status(409).render('categorias/form', {
        title: 'Nueva categoría',
        categoria: values,
        action: '/categorias',
        submitLabel: 'Crear categoría',
        error: 'Ya existe una categoría con ese nombre.'
      });
      return;
    }
    next(error);
  }
}

export async function mostrarEditarCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = getId(req);
  if (!id) {
    res.status(404).render('errors/404', { title: 'Categoría no encontrada' });
    return;
  }

  try {
    const [rows] = await pool.execute<Categoria[]>(
      'SELECT * FROM categorias WHERE id = ?',
      [id]
    );
    if (!rows[0]) {
      res.status(404).render('errors/404', { title: 'Categoría no encontrada' });
      return;
    }
    res.render('categorias/form', {
      title: 'Editar categoría',
      categoria: rows[0],
      action: `/categorias/${id}/editar`,
      submitLabel: 'Guardar cambios',
      error: null
    });
  } catch (error) {
    next(error);
  }
}

export async function actualizarCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = getId(req);
  const values = categoryValues(req);
  if (!id) {
    res.status(404).render('errors/404', { title: 'Categoría no encontrada' });
    return;
  }
  if (!values.nombre) {
    res.status(422).render('categorias/form', {
      title: 'Editar categoría',
      categoria: { id, ...values },
      action: `/categorias/${id}/editar`,
      submitLabel: 'Guardar cambios',
      error: 'El nombre es obligatorio.'
    });
    return;
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?',
      [values.nombre, values.descripcion || null, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).render('errors/404', { title: 'Categoría no encontrada' });
      return;
    }
    res.redirect('/categorias?message=Categoría actualizada correctamente');
  } catch (error) {
    if (isDuplicateEntry(error)) {
      res.status(409).render('categorias/form', {
        title: 'Editar categoría',
        categoria: { id, ...values },
        action: `/categorias/${id}/editar`,
        submitLabel: 'Guardar cambios',
        error: 'Ya existe una categoría con ese nombre.'
      });
      return;
    }
    next(error);
  }
}

export async function eliminarCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = getId(req);
  if (!id) {
    res.redirect('/categorias?error=Categoría no válida');
    return;
  }
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM categorias WHERE id = ?',
      [id]
    );
    const query = result.affectedRows
      ? 'message=Categoría eliminada correctamente'
      : 'error=La categoría no existe';
    res.redirect(`/categorias?${query}`);
  } catch (error) {
    next(error);
  }
}

function isDuplicateEntry(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY';
}
