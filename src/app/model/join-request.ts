export class JoinRequest {

  invitingUser: string;
  invitedUser: string;


  constructor(invitingUser: string, invitedUser: string) {
    this.invitingUser = invitingUser;
    this.invitedUser = invitedUser;
  }
}
