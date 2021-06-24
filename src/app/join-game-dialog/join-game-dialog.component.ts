import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-join-game-dialog',
  templateUrl: './join-game-dialog.component.html',
  styleUrls: ['./join-game-dialog.component.css']
})
export class JoinGameDialogComponent implements OnInit{

  invitingUser = '';

  ngOnInit() {
    this.invitingUser = this.data.invitingUser;
  }

  constructor(public dialogRef: MatDialogRef<JoinGameDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  @Output() answerEvent = new EventEmitter<string>();

  onYes() {
    this.dialogRef.close({answer: 'yes'});
  }

  onNo() {
    this.dialogRef.close({answer: 'no'});
  }
}
