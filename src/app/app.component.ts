import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Button} from "./model/button";
import * as SockJS from "sockjs-client";
import {CompatClient, Stomp} from "@stomp/stompjs";
import {JoinRequest} from "./model/join-request";
import {JoinResposne} from "./model/join-resposne";
import {JoinGameDialogComponent} from "./join-game-dialog/join-game-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MoveSent} from "./model/move-sent";
import {Reset} from "./model/reset";
import {MoveReceived} from "./model/move-received";
import {ResponseDialogComponent} from "./negative-response-dialog/response-dialog.component";
import {GameResult} from "./model/game-result";
import {GameResultDialogComponent} from "./game-result-dialog/game-result-dialog.component";
import {HttpService} from "./services/http-service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  buttons: Button[] = [];
  userInfo: string;
  userVerifiedSuccessfully: boolean;
  usersList: string[] = [];
  private stompClient: CompatClient;
  userName: string;
  connected: boolean = false;
  selectedUser: string;
  invitingUser: string;
  disabled: boolean = true;
  whoseTurn: string;
  opponentName: string;
  alreadySelected: boolean[] = [];

  constructor(private httpService: HttpService,
              private changeDetection: ChangeDetectorRef,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    for (let i = 0; i < 9; i++) {
      this.buttons.push(new Button(i, "", true));
      this.alreadySelected[i] = false;
    }
    console.log(this.buttons);
  }

  connect() {
    if (this.isUsernameIncorrect()) {
      alert('Please input a correct nickname!');
      return;
    }

    this.httpService.connect(this.userName)
      .subscribe(data => {
          this.userInfo = data.text;
          this.userVerifiedSuccessfully = data.userVerifiedSuccessfully;
          if (!this.userVerifiedSuccessfully) {
            return;
          } else {
            this.setWebSocketConnection();
          }
        },
        err => {
          this.userInfo = err;
        });

  }

  setWebSocketConnection(): void {
    const socket = new SockJS('http://localhost:8080/game');
    this.stompClient = Stomp.over(socket);
    const _this = this;
    this.stompClient.connect({username: _this.userName}, function () {
      // console.log('Connected: ' + frame);

      _this.stompClient.subscribe('/topic/active', function () {
        console.log('wiadomosc z topic/active');
        _this.updateUsers(_this.userName);
      });

      _this.stompClient.subscribe('/user/queue/joinRequest', function (output) {
        _this.joinRequestReceived(JSON.parse(output.body));
      });

      _this.stompClient.subscribe('/user/queue/joinResponse', function (output) {
        _this.joinResponseReceived(JSON.parse(output.body));
      });

      _this.stompClient.subscribe('/user/queue/reset', function (output) {
        _this.reset(JSON.parse(output.body));
      })

      _this.stompClient.subscribe('/user/queue/moveReceived', function (output) {
        _this.moveReceived(JSON.parse(output.body));
      })

      _this.stompClient.subscribe('/user/queue/gameResult', function (output) {
        _this.gameResult(JSON.parse(output.body));
      })

      _this.sendConnection();
      _this.connected = true;
    });
  }

  joinRequestReceived(joinRequest: JoinRequest): void {
    this.invitingUser = joinRequest.invitingUser;
    this.openInvitationDialog();
  }

  joinResponseReceived(joinResponse: JoinResposne) {
    this.openResponseDialog(joinResponse.decision);
  }

  gameResult(gameResult: GameResult) {
    this.openResultDialog(gameResult.winner);
    for (let i = 0; i < 9; i++) {
      this.buttons[i].disabled = true;
      this.buttons[i].text = '';
      this.alreadySelected[i] = false;
      this.whoseTurn = '';
    }
  }

  reset(reset: Reset) {
    this.disabled = reset.disabled;

    if (!this.disabled) {
      this.whoseTurn = 'Your turn';
    } else {
      this.whoseTurn = '';
    }

    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].disabled = reset.disabled;
      this.alreadySelected[i] = false;
    }
    this.opponentName = reset.opponentName;
    console.log('my name: ' + this.userName + ', opponent name: ' + reset.opponentName);
    this.changeDetection.detectChanges();
  }

  moveReceived(move: MoveReceived) {
    this.buttons[move.fieldNumber].disabled = true;
    this.alreadySelected[move.fieldNumber] = true;
    for (let i = 0; i < 9; i++) {
      if (!this.alreadySelected[i]) {
        this.buttons[i].disabled = move.boardDisabled;
      }
    }
    this.buttons[move.fieldNumber].text = move.text;
    if (move.boardDisabled) {
      this.whoseTurn = "";
    } else {
      this.whoseTurn = "Your turn"
    }
    this.changeDetection.detectChanges();
  }

  disconnect() {
    if (this.stompClient != null) {
      this.httpService.disconnect(this.userName)
        .subscribe(data => {
            console.log(data);
          },
          err => {
            console.error(err);
          });
      this.sendConnection();
      this.stompClient.disconnect();
    }
    this.connected = false;
    console.log('Disconnected!');
  }

  private isUsernameIncorrect() {
    return this.userName == null ||
      this.userName === '' ||
      this.userName.includes('?') ||
      this.userName.includes('&') ||
      this.userName.includes(' ');
  }

  updateUsers(userName: string): void {
    this.httpService.updateUsers(userName)
      .subscribe(data => {
          this.usersList = data;
          console.log('received data from updateUsers: ' + this.usersList);
          this.changeDetection.detectChanges();
        },
        error => {
          console.error('update user error: ' + error);
        }
      );
  }

  sendConnection(): void {
    this.updateUsers(this.userName);
  }

  connectWithSelectedUser(selectedUser: string) {
    this.selectedUser = selectedUser;
    console.log('Selected user: ' + this.selectedUser);

    let joinRequest = new JoinRequest(this.userName, this.selectedUser);

    this.stompClient.send('/app/joinRequest', {userName: this.userName},
      JSON.stringify(joinRequest));
  }

  sendMove(number: number) {
    let move = new MoveSent(number, this.opponentName);
    this.stompClient.send('/app/sendMove', {userName: this.userName}, JSON.stringify(move))
  }

  openInvitationDialog(): void {
    let dialogRef = this.dialog.open(JoinGameDialogComponent, {data: {invitingUser: this.invitingUser}});
    dialogRef.afterClosed().subscribe(result => {
      let joinResponse = new JoinResposne(this.invitingUser, this.userName, result.answer);
      this.stompClient.send('/app/joinResponse', {userName: this.userName},
        JSON.stringify(joinResponse));
    });
  }

  openResponseDialog(decision: string): void {
    this.dialog.open(ResponseDialogComponent, {
      data:
        {
          invitedUser: this.selectedUser,
          decision: decision
        }
    });
  }

  openResultDialog(winner: string): void {
    this.dialog.open(GameResultDialogComponent, {
      data: {
        userName: this.userName,
        winner: winner
      }
    });
  }
}

