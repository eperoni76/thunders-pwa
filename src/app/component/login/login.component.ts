import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Se l'utente è già autenticato, reindirizza alla home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }

    this.loginForm = this.fb.group({
      codiceFiscale: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]]
    });
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const codiceFiscale = this.loginForm.get('codiceFiscale')?.value;

    try {
      const success = await this.authService.login(codiceFiscale);

      if (success) {
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Codice fiscale non riconosciuto. Accesso negato.';
      }
    } catch (error) {
      this.errorMessage = 'Errore durante il login. Riprova.';
    } finally {
      this.loading = false;
    }
  }

  onCodiceFiscaleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upperValue = input.value.toUpperCase();
    this.loginForm.get('codiceFiscale')?.setValue(upperValue, { emitEvent: false });
  }
}

