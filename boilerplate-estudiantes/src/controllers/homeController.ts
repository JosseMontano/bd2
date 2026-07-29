import { Request, Response } from 'express';

export function showHome(_req: Request, res: Response): void {
  res.render('index', {
    title: 'Inicio',
    courseName: 'Desarrollo web con Node.js, TypeScript y MariaDB'
  });
}
