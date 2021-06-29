import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {JoinGameDialogComponent} from './join-game-dialog/join-game-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {BrowserAnimationsModule, NoopAnimationsModule} from "@angular/platform-browser/animations";
import { ResponseDialogComponent } from './negative-response-dialog/response-dialog.component';
import { GameResultDialogComponent } from './game-result-dialog/game-result-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    JoinGameDialogComponent,
    ResponseDialogComponent,
    GameResultDialogComponent],

  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MatDialogModule,
    BrowserAnimationsModule],

  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
