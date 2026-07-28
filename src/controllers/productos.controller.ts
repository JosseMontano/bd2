import { NextFunction, Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { Categoria, CategoriaRelacion, Producto, ProductoListado } from '../types/models';

interface ProductValues {
  nombre: string;
  precio: string;
  stock: string;
  categoriaIds: number[];
}

function getId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function productValues(req: Request): ProductValues {
  const rawCategories = Array.isArray(req.body.categorias)
    ? req.body.categorias
    : req.body.categorias
      ? [req.body.categorias]
      : [];

  return {
    nombre: String(req.body.nombre ?? '').trim(),
    precio: String(req.body.precio ?? '').trim(),
    stock: String(req.body.stock ?? '0').trim(),
    categoriaIds: [...new Set<number>(rawCategories
      .map((value: unknown) => Number(value))
      .filter((id: number) => Number.isInteger(id) && id > 0))]
  };
}

function validationError(values: ProductValues): string | null {
  if (!values.nombre) return 'El nombre es obligatorio.';
  if (values.precio === '' || !Number.isFinite(Number(values.precio)) || Number(values.precio) < 0) {
    return 'El precio debe ser un número mayor o igual a cero.';
  }
  if (!Number.isInteger(Number(values.stock)) || Number(values.stock) < 0) {
    return 'El stock debe ser un entero mayor o igual a cero.';
  }
  return null;
}

async function getCategories(): Promise<Categoria[]> {
  const [categorias] = await pool.query<Categoria[]>(
    'SELECT * FROM categorias ORDER BY nombre ASC'
  );
  return categorias;
}

export async function listarProductos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [productos] = await pool.query<ProductoListado[]>(`
      SELECT p.id, p.nombre, p.precio, p.stock, p.created_at,
             GROUP_CONCAT(c.nombre ORDER BY c.nombre SEPARATOR ', ') AS categorias
      FROM productos p
      LEFT JOIN producto_categorias pc ON pc.producto_id = p.id
      LEFT JOIN categorias c ON c.id = pc.categoria_id
      GROUP BY p.id, p.nombre, p.precio, p.stock, p.created_at
      ORDER BY p.created_at DESC, p.id DESC
    `);
    res.render('productos/index', {
      title: 'Productos',
      productos,
      message: req.query.message,
      error: req.query.error
    });
  } catch (error) {
    next(error);
  }
}

export async function mostrarCrearProducto(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.render('productos/form', {
      title: 'Nuevo producto',
      producto: null,
      categorias: await getCategories(),
      selectedCategoryIds: [],
      action: '/productos',
      submitLabel: 'Crear producto',
      error: null
    });
  } catch (error) {
    next(error);
  }
}

export async function crearProducto(req: Request, res: Response, next: NextFunction): Promise<void> {
  const values = productValues(req);
  const errorMessage = validationError(values);
  if (errorMessage) {
    res.status(422).render('productos/form', {
      title: 'Nuevo producto',
      producto: values,
      categorias: await getCategories(),
      selectedCategoryIds: values.categoriaIds,
      action: '/productos',
      submitLabel: 'Crear producto',
      error: errorMessage
    });
    return;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
      [values.nombre, Number(values.precio), Number(values.stock)]
    );
    for (const categoriaId of values.categoriaIds) {
      await connection.execute(
        'INSERT INTO producto_categorias (producto_id, categoria_id) VALUES (?, ?)',
        [result.insertId, categoriaId]
      );
    }
    await connection.commit();
    res.redirect('/productos?message=Producto creado correctamente');
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

export async function mostrarEditarProducto(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = getId(req);
  if (!id) {
    res.status(404).render('errors/404', { title: 'Producto no encontrado' });
    return;
  }

  try {
    const [[productos], [relaciones], categorias] = await Promise.all([
      pool.execute<Producto[]>('SELECT * FROM productos WHERE id = ?', [id]),
      pool.execute<CategoriaRelacion[]>(
        'SELECT categoria_id FROM producto_categorias WHERE producto_id = ?',
        [id]
      ),
      getCategories()
    ]);
    if (!productos[0]) {
      res.status(404).render('errors/404', { title: 'Producto no encontrado' });
      return;
    }
    res.render('productos/form', {
      title: 'Editar producto',
      producto: productos[0],
      categorias,
      selectedCategoryIds: relaciones.map((row) => row.categoria_id),
      action: `/productos/${id}/editar`,
      submitLabel: 'Guardar cambios',
      error: null
    });
  } catch (error) {
    next(error);
  }
}

export async function actualizarProducto(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = getId(req);
  if (!id) {
    res.status(404).render('errors/404', { title: 'Producto no encontrado' });
    return;
  }
  const values = productValues(req);
  const errorMessage = validationError(values);
  if (errorMessage) {
    res.status(422).render('productos/form', {
      title: 'Editar producto',
      producto: { id, ...values },
      categorias: await getCategories(),
      selectedCategoryIds: values.categoriaIds,
      action: `/productos/${id}/editar`,
      submitLabel: 'Guardar cambios',
      error: errorMessage
    });
    return;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      'UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?',
      [values.nombre, Number(values.precio), Number(values.stock), id]
    );
    if (result.affectedRows === 0) {
      await connection.rollback();
      res.status(404).render('errors/404', { title: 'Producto no encontrado' });
      return;
    }
    await connection.execute(
      'DELETE FROM producto_categorias WHERE producto_id = ?',
      [id]
    );
    for (const categoriaId of values.categoriaIds) {
      await connection.execute(
        'INSERT INTO producto_categorias (producto_id, categoria_id) VALUES (?, ?)',
        [id, categoriaId]
      );
    }
    await connection.commit();
    res.redirect('/productos?message=Producto actualizado correctamente');
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

export async function eliminarProducto(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = getId(req);
  if (!id) {
    res.redirect('/productos?error=Producto no válido');
    return;
  }
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM productos WHERE id = ?',
      [id]
    );
    const query = result.affectedRows
      ? 'message=Producto eliminado correctamente'
      : 'error=El producto no existe';
    res.redirect(`/productos?${query}`);
  } catch (error) {
    next(error);
  }
}
