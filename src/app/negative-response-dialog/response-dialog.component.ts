import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-negative-response-dialog',
  templateUrl: './response-dialog.component.html',
  styleUrls: ['./response-dialog.component.css']
})
export class ResponseDialogComponent implements OnInit {


  responseText = '';

  constructor(public dialogRef: MatDialogRef<ResponseDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    if(this.data.decision == 'yes') {
      this.responseText = 'User ' + this.data.invitedUser + ' agreed to play!';
    } else {
      this.responseText = 'User ' + this.data.invitedUser + ' refused to play, sorry :(';
    }
  }

  onOk() {
    this.dialogRef.close();
  }
}
