import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit {

  body: string;
  result: Subject<number>;

  constructor(public modal: NgbActiveModal) {
    this.result = new Subject<number>();
  }

  ngOnInit(): void {
    
  }

  cancel() {
    this.result.next(-1);
    this.modal.dismiss();
  }

  no() {
    this.result.next(0);
    this.modal.close();
  }

  yes() {
    this.result.next(1);
    this.modal.close();
  };

}
