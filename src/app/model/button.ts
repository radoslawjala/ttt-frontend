export class Button {
  id: number;
  text: string;
  enabled: boolean

  constructor(id: number, text: string, enabled: boolean) {
    this.id = id;
    this.text = text;
    this.enabled = enabled;
  }
}
