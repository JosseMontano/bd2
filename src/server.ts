import 'dotenv/config';
import app from './app';
import { checkDatabaseConnection } from './config/database';

const port = Number(process.env.PORT ?? 3000);

async function start(): Promise<void> {
  try {
    await checkDatabaseConnection();
    app.listen(port, () => {
      console.log(`Servidor disponible en http://localhost:${port}`);
    });
  } catch (error) {
    console.error('No fue posible iniciar la aplicación:', error);
    process.exit(1);
  }
}

void start();
