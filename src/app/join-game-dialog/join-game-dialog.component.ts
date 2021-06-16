import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-join-game-dialog',
  templateUrl: './join-game-dialog.component.html',
  styleUrls: ['./join-game-dialog.component.css']
})
export class JoinGameDialogComponent {

  constructor(public dialogRef: MatDialogRef<JoinGameDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: any) { }

  @Output() answerEvent = new EventEmitter<string>();

  onYes() {
    this.dialogRef.close({answer: 'yes'});
  }

  onNo() {
    this.dialogRef.close({answer: 'no'});
  }
}
