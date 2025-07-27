import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import mongooseConfig from './config/mongoose.config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { IssueModule } from './issue/issue.module';
@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true , load:[mongooseConfig]}),
    MongooseModule.forRootAsync({
      useFactory:()=>({
        uri:process.env.MONGODB_URI
      })
    }),
    AuthModule,
    UsersModule,
    IssueModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
