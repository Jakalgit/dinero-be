import {
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { GameAction } from './game-action.model';

export interface GameSettingCreationAttrs {
  id: string;
  active: boolean;
  name: string;
  maxStake?: number;
}

@Table({ tableName: 'game_settings' })
export class GameSetting extends Model<GameSetting, GameSettingCreationAttrs> {
  @PrimaryKey
  @Column({ type: DataType.STRING, primaryKey: true })
  id: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  active: boolean;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.BIGINT, field: 'max_stake' })
  maxStake?: number;

  @HasMany(() => GameAction)
  gameActions: GameAction[];
}
