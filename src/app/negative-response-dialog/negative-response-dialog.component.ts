import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-negative-response-dialog',
  templateUrl: './negative-response-dialog.component.html',
  styleUrls: ['./negative-response-dialog.component.css']
})
export class NegativeResponseDialogComponent implements OnInit {

  invitedUser = '';

  constructor(public dialogRef: MatDialogRef<NegativeResponseDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.invitedUser = this.data.invitedUser;
  }

  onOk() {
    this.dialogRef.close();
  }
}
