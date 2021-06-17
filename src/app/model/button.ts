export class Button {
  id: number;
  text: string;
  disabled: boolean

  constructor(id: number, text: string, disabled: boolean) {
    this.id = id;
    this.text = text;
    this.disabled = disabled;
  }
}
