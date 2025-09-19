export class GameError extends Error {
  constructor(code, ...params) {
    super("Game Error");
    this.code = code;
    this.params = params;
  }
}