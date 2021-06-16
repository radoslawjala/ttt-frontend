export class JoinResposne {

  invitingUser: string;
  invitedUser: string;
  decision: boolean;


  constructor(invitingUser: string, invitedUser: string, decision: boolean) {
    this.invitingUser = invitingUser;
    this.invitedUser = invitedUser;
    this.decision = decision;
  }
}
