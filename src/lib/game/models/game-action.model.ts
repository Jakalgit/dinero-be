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

interface GameActionCreationAttrs {
  classic: boolean;
  amountDifference: number;
  note?: string;
  gameSettingId: number;
  userId: number;
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

  @Column({ type: DataType.TEXT })
  note: string;

  @BelongsTo(() => GameSetting)
  gameSetting: GameSetting;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => GameSetting)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'game_setting_id',
  })
  gameSettingId: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'user_id' })
  userId: number;
}
