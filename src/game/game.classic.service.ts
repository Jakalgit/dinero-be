import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CLASSIC_GAME_FLOW } from '../lib/game/constants/classic-game-flow.constant';
import { IClassicGameFlow } from '../lib/game/interfaces/i-classic-game.flow';

@Injectable()
export class GameClassicService {
  constructor(
    @Inject(CLASSIC_GAME_FLOW)
    private readonly classicGameFlows: IClassicGameFlow[],
  ) {}

  async playGame(body: any, gameId: string) {
    const gameFlow = this.classicGameFlows.find((el) => el.isSupport(gameId));

    if (!gameFlow) {
      throw new BadRequestException(`Not found game (${gameId})`);
    }

    return gameFlow.tryPlayGame(body);
  }
}
