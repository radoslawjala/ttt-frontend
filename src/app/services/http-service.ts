import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient) {
  }

  connect(username: string): Observable<any> {
    // return this.httpClient.post<string>('http://localhost:8080/rest/user-connect', {username: username});
    return this.httpClient.post<string>('https://hidden-ravine-77659.herokuapp.com/rest/user-connect', {username: username});
  }

  disconnect(username: string): Observable<any> {
    // return this.httpClient.post<string>('http://localhost:8080/rest/user-disconnect', {useername: username})
    return this.httpClient.post<string>('https://hidden-ravine-77659.herokuapp.com/rest/user-disconnect', {useername: username})
  }

  updateUsers(username: string): Observable<any> {
    // return this.httpClient.get<string[]>('http://localhost:8080/rest/active-users-except/' + username);
    return this.httpClient.get<string[]>('https://hidden-ravine-77659.herokuapp.com/rest/active-users-except/' + username);
  }
}
