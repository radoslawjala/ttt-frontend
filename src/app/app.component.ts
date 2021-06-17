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
import {GameMove} from "./model/game-move";
import {Reset} from "./model/reset";

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

  constructor(private http: HttpClient, private changeDetection: ChangeDetectorRef, public dialog: MatDialog) {
  }

  ngOnInit(): void {
    for (let i = 0; i < 9; i++) {
      this.buttons.push(new Button(i, String(i), true));
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

              _this.stompClient.subscribe('/user/queue/joinrequest', function (output) {
                _this.joinRequestReceived(JSON.parse(output.body));
              });

              _this.stompClient.subscribe('/user/queue/joinresponse', function (output) {
                _this.joinResponseReceived(JSON.parse(output.body));
              });

              _this.stompClient.subscribe('/user/queue/gamemovereceived', function (output) {
                _this.gameMoveReceived(JSON.parse(output.body));
              })

              _this.stompClient.subscribe('/user/queue/reset', function (output) {
                _this.reset(JSON.parse(output.body));
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
    this.openDialog(this.invitingUser);
  }

  joinResponseReceived(joinResponse: JoinResposne) {
    console.log('Response from user ' + joinResponse.invitingUser + ': ' + joinResponse.decision);
  }

  reset(reset: Reset) {
    console.log('from reset: ' + reset.disabled);
    this.disabled = reset.disabled;
    for(let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].disabled = reset.disabled;
    }
    this.changeDetection.detectChanges();
  }

  gameMoveReceived(gameMove: GameMove) {

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

    this.stompClient.send('/app/joinrequest', {userName: this.userName},
      JSON.stringify(joinRequest));
  }

  setLabelAndSendMove(number: number) {
    this.buttons[number].text = "clicked";
    this.buttons[number].disabled = true;
    this.changeDetection.detectChanges();
  }

  openDialog(invitingUser: string): void {
    let dialogRef = this.dialog.open(JoinGameDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      let joinResponse = new JoinResposne(this.invitingUser, this.userName, result.answer);
      this.stompClient.send('/app/joinresponse', {userName: this.userName},
        JSON.stringify(joinResponse));
    });
  }
}

