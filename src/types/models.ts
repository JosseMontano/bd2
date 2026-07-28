import { RowDataPacket } from 'mysql2';

export interface Categoria extends RowDataPacket {
  id: number;
  nombre: string;
  descripcion: string | null;
  created_at: Date;
}

export interface Producto extends RowDataPacket {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  created_at: Date;
}

export interface ProductoListado extends Producto {
  categorias: string | null;
}

export interface CategoriaRelacion extends RowDataPacket {
  categoria_id: number;
}
