export class Reset {
  enabled: boolean;
  opponentName: string;

  constructor(enabled: boolean, opponentName: string) {
    this.enabled = enabled;
    this.opponentName = opponentName;
  }
}
