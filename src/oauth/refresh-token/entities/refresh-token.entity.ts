import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { ClientOauth } from '../../client/client.entity';

@Entity()
export class RefreshTokenOauth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  refreshToken: string;

  @ManyToOne(() => ClientOauth)
  client: ClientOauth;

  @ManyToOne(() => User)
  user: User;

  @Column('timestamp')
  expiresAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
