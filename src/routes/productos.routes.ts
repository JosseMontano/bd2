import { Router } from 'express';
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarProductos,
  mostrarCrearProducto,
  mostrarEditarProducto
} from '../controllers/productos.controller';

const router = Router();

router.get('/', listarProductos);
router.get('/nuevo', mostrarCrearProducto);
router.post('/', crearProducto);
router.get('/:id/editar', mostrarEditarProducto);
router.post('/:id/editar', actualizarProducto);
router.post('/:id/eliminar', eliminarProducto);

export default router;
