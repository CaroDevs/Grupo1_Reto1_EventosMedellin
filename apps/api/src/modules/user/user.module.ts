import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserFactoryModule } from '../../common/users/user-factory.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [AuthModule, UserFactoryModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
