import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-game-result',
  templateUrl: './game-result.-dialog.component.html',
  styleUrls: ['./game-result-dialog.component.css']
})
export class GameResultDialogComponent implements OnInit {

  text: string;

  constructor(public dialogRef: MatDialogRef<GameResultDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    if(this.data.userName == this.data.winner) {
      this.text = 'You won son of a bitch!';
    } else {
      this.text = 'You lost motherfucker!';
    }
  }

  onOk() {
    this.dialogRef.close();
  }
}
