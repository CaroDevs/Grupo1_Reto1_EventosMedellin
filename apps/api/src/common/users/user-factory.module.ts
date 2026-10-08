import { Module } from '@nestjs/common';
import { UserFactory } from './user.factory';
import { RegistrationStrategy } from './registration.strategy';
import { GoogleOAuthStrategy } from './google-oauth.strategy';
import { AdminCreationStrategy } from './admin-creation.strategy';

@Module({
  providers: [UserFactory, RegistrationStrategy, GoogleOAuthStrategy, AdminCreationStrategy],
  exports: [UserFactory, RegistrationStrategy, GoogleOAuthStrategy, AdminCreationStrategy],
})
export class UserFactoryModule {}
