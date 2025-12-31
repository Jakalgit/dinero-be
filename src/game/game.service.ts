import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GameAction } from '../lib/game/models/game-action.model';
import Decimal from 'decimal.js';
import { col, fn, Op } from 'sequelize';
import { GameSetting } from '../lib/game/models/game-setting.model';
import { unitsToMC } from '../lib/conversion/units-to-ms';
import { RedisService } from '../redis/redis.service';
import { GameRedisKeysEnum } from '../lib/game/enums/redis-keys.enum';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(GameAction)
    private readonly gameActionRepository: typeof GameAction,
    @InjectModel(GameSetting)
    private readonly gameSettingRepository: typeof GameSetting,
    private readonly redisService: RedisService,
  ) {}

  async getGameSettings(id: string) {
    const redisKey = `${GameRedisKeysEnum.GAME_SETTING}:${id}`;

    let gameSetting: GameSetting = null;

    if (await this.redisService.exists(redisKey)) {
      try {
        const gameSettingRedis = await this.redisService.get(redisKey);

        gameSetting = JSON.parse(gameSettingRedis);
      } catch {}
    } else {
      gameSetting = await this.gameSettingRepository.findOne({
        where: { id },
        raw: true,
      });

      if (gameSetting) {
        await this.redisService.set(
          redisKey,
          JSON.stringify(gameSetting),
          3600,
        );
      }
    }

    if (!gameSetting) {
      throw new BadRequestException('No game settings found');
    }

    return {
      ...gameSetting,
      ...(gameSetting.maxStake && {
        maxStake: unitsToMC(gameSetting.maxStake),
      }),
    };
  }

  async getGameActionsForUser(userId: string) {
    const gameActions = await this.gameActionRepository.findAll({
      where: { userId },
      raw: true,
    });

    let amountOfWinnings = new Decimal(0);

    gameActions
      .filter((el) => el.amountDifference > 0)
      .forEach((el) => {
        amountOfWinnings = amountOfWinnings.add(el.amountDifference);
      });

    return {
      numberOfGames: gameActions.length,
      amountOfWinnings,
    };
  }

  async getGamesCountInfo(userId: string) {
    const groupedGameActions = (await this.gameActionRepository.findAll({
      where: { userId },
      attributes: [
        'gameSettingId',
        [fn('COUNT', col('game_setting_id')), 'count'],
      ],
      group: ['gameSettingId'],
      raw: true,
    })) as unknown as { gameSettingId: string; count: number }[];

    const groupSettingIds = groupedGameActions.map((el) => el.gameSettingId);

    const gameSettings = await this.gameSettingRepository.findAll({
      where: {
        id: { [Op.or]: groupSettingIds },
      },
      raw: true,
    });

    return groupedGameActions.map((el) => {
      const gameSetting = gameSettings.find((gs) => gs.id === el.gameSettingId);

      return {
        name: gameSetting?.name,
        count: el.count,
      };
    });
  }

  async getGameActionsForTab({
    userId,
    page,
    pageCount,
  }: {
    userId: string;
    page: number;
    pageCount: number;
  }) {
    const gameActions = await this.gameActionRepository.findAndCountAll({
      where: { userId },
      raw: true,
      limit: pageCount,
      offset: (page - 1) * pageCount,
      order: [['createdAt', 'ASC']],
      attributes: [
        'amount_difference',
        'amount_stake',
        'coefficient',
        'createdAt',
      ],
    });

    // Общее количество записей
    const totalRecords = gameActions.count;

    // Общее количество страниц
    const totalPages = Math.ceil(totalRecords / pageCount);

    // Полученные записи
    const records = gameActions.rows.map((el) => {
      return {
        ...el,
        amountDifference: unitsToMC(el.amountDifference),
        amountStake: unitsToMC(el.amountStake),
      };
    });

    return {
      records,
      totalPages,
    };
  }

  async findGameSettings(gameId: string) {
    const gameSetting = await this.gameSettingRepository.findOne({
      where: { id: gameId },
      raw: true,
    });

    if (!gameSetting) {
      throw new BadRequestException('Game with not found');
    }

    if (!gameSetting.active) {
      throw new ServiceUnavailableException(
        'The game is temporarily out of service',
      );
    }

    return gameSetting;
  }
}
