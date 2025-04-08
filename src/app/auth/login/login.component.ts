import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GoogleLoginDirective } from '../google-login/google-login.directive';

@Component({
  selector: 'login',
  imports: [RouterLink, GoogleLoginDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loggedGoogle(resp: google.accounts.id.CredentialResponse) {
    // Envia esto tu API
    console.log(resp.credential);
  }
}
