import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
import { GameClassicService } from './game.classic.service';
import { AuthorizedProfile } from '../lib/decorators/authorized-profile.decorator';
import { TelegramAuthGuard } from '../auth/guards/telegram.auth.guard';

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly gameClassicService: GameClassicService,
  ) {}

  @UseGuards(TelegramAuthGuard)
  @Post('/classic/:gameId')
  playClassicGame(
    @AuthorizedProfile() userId: string,
    @Body() body: any,
    @Param('gameId') gameId: string,
  ) {
    return this.gameClassicService.playGame({ ...body, userId }, gameId);
  }

  @UseGuards(TelegramAuthGuard)
  @Get('/user-info/:userId')
  getGameActions(@AuthorizedProfile() userId: string) {
    return this.gameService.getGameActionsForUser(userId);
  }

  @UseGuards(TelegramAuthGuard)
  @Get('/tab-info/games-count')
  getGamesCountInfo(@AuthorizedProfile() userId: string) {
    return this.gameService.getGamesCountInfo(userId);
  }

  @UseGuards(TelegramAuthGuard)
  @Get('/tab-info/actions')
  getGameActionsInfo(
    @AuthorizedProfile() userId: string,
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
