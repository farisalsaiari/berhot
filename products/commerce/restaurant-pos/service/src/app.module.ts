import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MenuModule } from './modules/menu/menu.module';
import { TableModule } from './modules/tables/table.module';
import { KitchenModule } from './modules/kitchen/kitchen.module';
import { ReservationModule } from './modules/reservations/reservation.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    MenuModule,
    TableModule,
    KitchenModule,
    ReservationModule,
  ],
})
export class AppModule {}
