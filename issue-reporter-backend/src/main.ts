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
  await usersService.ensureAdminExists();

  const adminEmail = 'admin@issueReporter.com';

  const existingAdmin = await usersService.findByEmail(adminEmail);

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    await usersService.create({
      name: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    console.log(
      `✅ Admin user created with email: ${adminEmail} and password: Admin@123`,
    );
  } else {
    console.log('✅ Admin already exists.');
  }

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  await app.listen(7777);
}
bootstrap();
