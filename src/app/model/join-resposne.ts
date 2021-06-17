export class JoinResposne {

  invitingUser: string;
  invitedUser: string;
  decision: string;


  constructor(invitingUser: string, invitedUser: string, decision: string) {
    this.invitingUser = invitingUser;
    this.invitedUser = invitedUser;
    this.decision = decision;
  }
}
