import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Button} from "./model/button";
import {HttpClient} from "@angular/common/http";
import {SimpleMessage} from "./model/simple-message";
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
  enabled: boolean = true;
  whichTurn: string;
  opponentName: string;

  constructor(private http: HttpClient, private changeDetection: ChangeDetectorRef, public dialog: MatDialog) {
  }

  ngOnInit(): void {
    for (let i = 0; i < 9; i++) {
      this.buttons.push(new Button(i, "", false));
    }
    console.log(this.buttons);
  }

  connect() {
    if (this.isUsernameIncorrect()) {
      alert('Please input a correct nickname!');
      return;
    }

    this.http.post<SimpleMessage>('http://localhost:8080/rest/user-connect', {username: this.userName})
      .subscribe(data => {
          this.userInfo = data.text;
          this.userVerifiedSuccessfully = data.userVerifiedSuccessfully;
          if (!this.userVerifiedSuccessfully) {
            return;
          } else {
            const socket = new SockJS('http://localhost:8080/game');
            this.stompClient = Stomp.over(socket);
            const _this = this;
            this.stompClient.connect({username: _this.userName}, function (frame: string) {
              console.log('Connected: ' + frame);

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

              _this.sendConnection();
              _this.connected = true;
            });
          }
        },
        err => {
          this.userInfo = err;
        });

  }


  joinRequestReceived(joinRequest: JoinRequest): void {
    this.invitingUser = joinRequest.invitingUser;
    this.openInvitationDialog();
  }

  joinResponseReceived(joinResponse: JoinResposne) {
    this.openNegativeResponseDialog(joinResponse.decision);
  }

  reset(reset: Reset) {
    this.enabled = reset.enabled;

    if(this.enabled) {
      this.whichTurn = 'Your turn';
    }
    else {
      this.whichTurn = '';
    }

    for(let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].enabled = reset.enabled;
    }
    this.changeDetection.detectChanges();
  }

  moveReceived(move: MoveReceived) {
    console.log(move.text + " " + move.fieldNumber);
    this.enabled = false;
    this.buttons[move.fieldNumber].enabled = false;
    this.buttons[move.fieldNumber].text = move.text;
    this.changeDetection.detectChanges();
  }

  disconnect() {
    if (this.stompClient != null) {
      this.http.post<string>('http://localhost:8080/rest/user-disconnect', {username: this.userName})
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
    this.http.get<string[]>('http://localhost:8080/rest/active-users-except/' + userName).subscribe(data => {
        this.usersList = data;
        console.log('received data from updateUsers: ' + this.usersList);
        this.changeDetection.detectChanges();
      },
      error => {
        console.error('update user error: ' + error);
      });
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
    // this.buttons[number].text = "clicked";
    // this.buttons[number].enabled = false;
    // this.changeDetection.detectChanges();
    let move = new MoveSent(number);
    this.stompClient.send('/app/sendMove', {userName: this.userName}, JSON.stringify(move))
  }

  openInvitationDialog(): void {
    let dialogRef = this.dialog.open(JoinGameDialogComponent, {data: { invitingUser: this.invitingUser}});
    dialogRef.afterClosed().subscribe(result => {
      let joinResponse = new JoinResposne(this.invitingUser, this.userName, result.answer);
      this.stompClient.send('/app/joinResponse', {userName: this.userName},
        JSON.stringify(joinResponse));
    });
  }

  openNegativeResponseDialog(decision: string): void {
   this.dialog.open(ResponseDialogComponent, {data:
       { invitedUser: this.selectedUser,
       decision: decision}});
  }
}

