export interface IClassicGameFlow {
  isSupport(gameId: string): boolean;

  tryPlayGame(requestBody: any): Promise<any>;
}
