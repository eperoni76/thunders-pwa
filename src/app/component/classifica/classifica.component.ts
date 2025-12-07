import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClassificaService } from '../../service/classifica.service';
import { Classifica } from '../../model/classifica';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-classifica',
  templateUrl: './classifica.component.html',
  styleUrls: ['./classifica.component.css']
})
export class ClassificaComponent implements OnInit, OnDestroy {

  classifica: Classifica[] = [];
  private classificaSubscription?: Subscription;

  constructor(private classificaService: ClassificaService) { }

  ngOnInit(): void {
    this.classificaSubscription = this.classificaService.getClassificaObservable().subscribe(
      classifica => {
        this.classifica = classifica;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.classificaSubscription) {
      this.classificaSubscription.unsubscribe();
    }
  }
}

