export class Reset {
  disabled: boolean;
  opponentName: string;

  constructor(disabled: boolean, opponentName: string) {
    this.disabled = disabled;
    this.opponentName = opponentName;
  }
}
