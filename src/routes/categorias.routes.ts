import { Router } from 'express';
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
  mostrarCrearCategoria,
  mostrarEditarCategoria
} from '../controllers/categorias.controller';

const router = Router();

router.get('/', listarCategorias);
router.get('/nueva', mostrarCrearCategoria);
router.post('/', crearCategoria);
router.get('/:id/editar', mostrarEditarCategoria);
router.post('/:id/editar', actualizarCategoria);
router.post('/:id/eliminar', eliminarCategoria);

export default router;
