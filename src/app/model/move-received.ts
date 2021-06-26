export class MoveReceived {

  fieldNumber: number;
  text: string;
  boardDisabled: boolean;

  constructor(fieldNumber: number, text: string,  boardDisabled: boolean) {
    this.fieldNumber = fieldNumber;
    this.text = text;
    this.boardDisabled = boardDisabled;
  }
}
