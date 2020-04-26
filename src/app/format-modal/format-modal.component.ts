import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { FONT_FAMILIES } from '../content/font-familities';

@Component({
  selector: 'app-format-modal',
  templateUrl: './format-modal.component.html',
  styleUrls: ['./format-modal.component.scss']
})
export class FormatModalComponent implements OnInit {

  @ViewChild("textExample") textExample: ElementRef;

  size$ = new Subject<number>();
  family$ = new Subject<string>();
  
  fontFamilies = FONT_FAMILIES;

  fontSize = new FormControl();
  fontFamily = new FormControl();

  constructor(public modal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  ok() {
    this.apply();
    this.modal.close();  
  }

  apply() {
    this.size$.next(this.fontSize.value);
    this.family$.next(this.fontFamily.value);
  }

  cancel() {
    this.modal.dismiss();
  }

  

}
