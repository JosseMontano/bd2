import express, { NextFunction, Request, Response } from 'express';
import path from 'node:path';
import categoriasRoutes from './routes/categorias.routes';
import productosRoutes from './routes/productos.routes';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.resolve(process.cwd(), 'src/views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(process.cwd(), 'src/public')));

app.get('/', (_req, res) => res.redirect('/productos'));
app.use('/productos', productosRoutes);
app.use('/categorias', categoriasRoutes);

app.use((_req, res) => {
  res.status(404).render('errors/404', { title: 'Página no encontrada' });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).render('errors/500', {
    title: 'Error interno',
    error: process.env.NODE_ENV === 'development' ? error : null
  });
});

export default app;
