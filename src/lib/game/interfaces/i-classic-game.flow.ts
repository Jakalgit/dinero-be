export interface ClassicGameInterface {
  isSupport(gameId: string): boolean;

  tryPlayGame(requestBody: any): Promise<any>;
}
