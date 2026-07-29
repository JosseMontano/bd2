# Boilerplate académico: Express + EJS + TypeScript + MariaDB

Esta plantilla contiene la configuración inicial de una aplicación web tradicional
con renderizado del lado del servidor. No es una API REST: las rutas deben renderizar
vistas EJS o redirigir al usuario después de procesar formularios.

## Requisitos

- Node.js 20 o superior.
- MariaDB ejecutándose mediante XAMPP, WAMP, Laragon u otra instalación local.
- phpMyAdmin o un cliente equivalente.

## Instalación

1. Clona o descarga el proyecto y abre una terminal en esta carpeta.

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. El archivo `.env` ya contiene la configuración local habitual:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=proyecto_estudiantes
   ```

   Si tu instalación utiliza otra contraseña, puerto o usuario, modifica esos
   valores. Cuando `.env` no esté incluido en una copia del proyecto, duplica
   `.env.example`, renómbralo como `.env` y ajusta los datos.

4. Abre phpMyAdmin, entra en la pestaña **Importar**, selecciona `schema.sql` y
   ejecuta la importación. También puedes pegar su contenido en la pestaña **SQL**.

5. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

6. Visita `http://localhost:3000`.

## Comandos disponibles

```bash
npm run dev        # Desarrollo con recarga automática
npm run typecheck  # Verificación de tipos sin generar archivos
npm run build      # Compilación a la carpeta dist
npm start          # Ejecución del build de producción
```

## Trabajo del estudiante

- Agregar las tablas del ejercicio en `schema.sql`.
- Crear controladores dentro de `src/controllers`.
- Definir y montar rutas dentro de `src/routes`.
- Diseñar vistas y parciales EJS dentro de `src/views`.
- Escribir consultas SQL puras y parametrizadas con `mysql2/promise`.

No se debe incorporar un ORM. Las consultas deben utilizar marcadores `?` para
los valores proporcionados por el usuario.

## Estructura

```text
src/
├── config/
│   └── db.ts
├── controllers/
│   └── homeController.ts
├── public/
│   └── css/
│       └── styles.css
├── routes/
│   └── index.ts
├── views/
│   ├── errors/
│   │   ├── 404.ejs
│   │   └── 500.ejs
│   ├── partials/
│   │   ├── footer.ejs
│   │   └── header.ejs
│   └── index.ejs
├── app.ts
└── server.ts
```
