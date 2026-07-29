import 'dotenv/config';
import app from './app';
import { testDatabaseConnection } from './config/db';

const port = Number(process.env.PORT ?? 3000);

async function startServer(): Promise<void> {
  try {
    await testDatabaseConnection();
    console.log('Conexión a MariaDB establecida correctamente.');

    app.listen(port, () => {
      console.log(`Servidor disponible en http://localhost:${port}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar la aplicación:', error);
    process.exit(1);
  }
}

void startServer();
