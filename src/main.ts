import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TraceHeaderInterceptor } from './lib/interceptors/trace.interceptor';

async function bootstrap() {
  try {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule);
    const isProd = process.env.NODE_ENV === 'production';

    app.setGlobalPrefix('api');
    app.useGlobalInterceptors(new TraceHeaderInterceptor());

    app.enableCors({
      origin: isProd ? [] : '*',
      credentials: true,
    });

    await app.listen(PORT, () =>
      console.log(`Server is running on port ${PORT}`),
    );
  } catch (error) {
    console.error(error);
  }
}
bootstrap();
