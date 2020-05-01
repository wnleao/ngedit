import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

export enum ConfirmEvent {
  CANCEL = -1,
  NO = 0,
  YES = 1
}

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit {

  body: string;

  constructor(
    private modal: NgbActiveModal
  ) {
  }

  ngOnInit(): void {
  }

  cancel() {
    this.modal.dismiss(ConfirmEvent.CANCEL);
  }

  no() {
    this.modal.close(ConfirmEvent.NO);
  }

  yes() {
    this.modal.close(ConfirmEvent.YES);
  };

}
