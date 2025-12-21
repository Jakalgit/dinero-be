import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { GameSetting } from './game-setting.model';
import { User } from '../../user/models/user.model';

export interface GameActionCreationAttrs {
  classic: boolean;
  amountDifference: number;
  amountStake: number;
  coefficient: string;
  note?: string;
  gameSettingId: string;
  userId: string;
}

@Table({ tableName: 'game_actions' })
export class GameAction extends Model<GameAction, GameActionCreationAttrs> {
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  classic: boolean;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    field: 'amount_difference',
  })
  amountDifference: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    field: 'amount_stake',
  })
  amountStake: number;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  coefficient: string;

  @Column({ type: DataType.TEXT })
  note: string;

  @BelongsTo(() => GameSetting)
  gameSetting: GameSetting;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => GameSetting)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'game_setting_id',
  })
  gameSettingId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false, field: 'user_id' })
  userId: string;
}
