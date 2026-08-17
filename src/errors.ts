export class InputTooLongError extends Error {
  constructor(readonly max: number) {
    super(`Input is too long (max ${max} characters)`)
    this.name = "InputTooLongError"
  }
}

export class MapNotFoundError extends Error {
  constructor(readonly systemCode: string) {
    // Byte-identical to the Ruby engine's message.
    super(`Couldn't locate ${systemCode}`)
    this.name = "MapNotFoundError"
  }
}
