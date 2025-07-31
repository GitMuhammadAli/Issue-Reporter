import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const usersService = app.get(UsersService);
  const existingAdmin = await usersService.findByEmail('admin@example.com');
  
   app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    await usersService.create({
      username: 'Admin',
      email: 'admin@issueReporter.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('✅ Admin user created with email: admin@example.com and password: Admin@123');
  } else {
    console.log('✅ Admin already exists.');
  }
app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  await app.listen(3000);
}
bootstrap();
