import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { Giocatore } from '../../model/giocatore';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  menuOpen = false;
  currentUser: Giocatore | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  isAdmin(): boolean {
    return this.authService.hasEditPermission();
  }

  logout() {
    this.authService.logout();
    this.menuOpen = false;
    this.router.navigate(['/login']);
  }
}
