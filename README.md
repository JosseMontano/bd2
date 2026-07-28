# Catálogo de productos SSR

Aplicación web tradicional renderizada en el servidor con Express, EJS, TypeScript y MySQL. Todas las operaciones de datos usan SQL parametrizado mediante `mysql2/promise`; no utiliza ORM ni responde con JSON.

## Puesta en marcha

1. En phpMyAdmin, abre la pestaña **Importar**, selecciona `schema.sql` y ejecuta
   la importación. También puedes copiar su contenido en la pestaña **SQL**.

   Como alternativa desde la terminal:

   ```bash
   mysql -u root -p < schema.sql
   ```

2. Copia `.env.example` como `.env` y ajusta las credenciales. La configuración
   de ejemplo utiliza los valores habituales de MariaDB en XAMPP/WAMP/Laragon:
   `localhost`, puerto `3306`, usuario `root` y contraseña vacía.

3. Instala las dependencias y ejecuta en desarrollo:

   ```bash
   npm install
   npm run dev
   ```

4. Abre `http://localhost:3000`.

## Producción

```bash
npm run build
npm start
```

La compilación genera JavaScript en `dist`. Las vistas EJS y los recursos estáticos se resuelven desde `src`, por lo que las carpetas `src/views` y `src/public` deben acompañar al despliegue y el proceso debe iniciarse desde la raíz del proyecto.
