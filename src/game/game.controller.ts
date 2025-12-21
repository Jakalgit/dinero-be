import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GameService } from './game.service';
import { GameClassicService } from './game.classic.service';

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly gameClassicService: GameClassicService,
  ) {}

  @Post('/classic/:gameId')
  playClassicGame(@Body() body: any, @Param('gameId') gameId: string) {
    return this.gameClassicService.playGame(body, gameId);
  }

  @Get('/user-info/:userId')
  getGameActions(@Param('userId') userId: string) {
    return this.gameService.getGameActionsForUser(userId);
  }

  @Get('/tab-info/games-count/:userId')
  getGamesCountInfo(@Param('userId') userId: string) {
    return this.gameService.getGamesCountInfo(userId);
  }

  @Get('/tab-info/actions/:userId')
  getGameActionsInfo(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('pageCount') pageCount: number = 6,
  ) {
    return this.gameService.getGameActionsForTab({ userId, page, pageCount });
  }

  @Get('/settings/:gameId')
  getGameSettings(@Param('gameId') gameId: string) {
    return this.gameService.getGameSettings(gameId);
  }
}
