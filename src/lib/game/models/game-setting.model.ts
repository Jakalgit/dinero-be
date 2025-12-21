import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { GameAction } from './game-action.model';

interface GameSettingCreationAttrs {
  active: boolean;
  name: string;
  maxStake?: number;
}

@Table({ tableName: 'game_settings' })
export class GameSetting extends Model<GameSetting, GameSettingCreationAttrs> {

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  active: boolean;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.BIGINT, field: 'max_stake' })
  maxStake: number;

  @HasMany(() => GameAction)
  gameActions: GameAction[];
}
