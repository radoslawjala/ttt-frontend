export class MoveReceived {

  fieldNumber: number;
  text: string;

  constructor(fieldNumber: number, text: string) {
    this.fieldNumber = fieldNumber;
    this.text = text;
  }
}
