import { Component, ViewChild, ElementRef, HostListener, QueryList, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NgbActiveModal, NgbModal, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmEvent, ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { of } from 'rxjs';
import { FormatModalComponent } from './format-modal/format-modal.component';

// v0
// https://www.sitepoint.com/build-a-desktop-application-with-electron-and-angular/

// use of base-href
// https://shekhargulati.com/2017/07/06/angular-4-use-of-base-href-and-deploy-url-build-options/

// Live reloading
// https://medium.com/@rdarida/electron-angular-live-reload-13ebc9808bb5
// removed from package.json // "electron": "ng build --base-href ./ && electron ."

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  remote;
  efs;
  dialog;
  changedContent = false;
  currContent: string;

  readonly INITIAL_FONT_SIZE = 16;
  readonly INITIAL_FONT_FAMILY = "Arial";

  @ViewChildren(NgbDropdown) dropdowns: QueryList<NgbDropdown>

  @ViewChild('textarea') textarea: ElementRef;

  content = new FormControl();
  path = "";

  constructor(
    private titleService: Title,
    private modalService: NgbModal,
  ) {

    if ((<any>window).require) {
      try {
        this.remote = (<any>window).require('electron').remote;
        this.efs = this.remote.require('fs');
        this.dialog = this.remote.dialog;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }

  }

  openIfOtherDropdownIsOpen(dropdown) {
    let currOpenDropdown = this.dropdowns.find(d => d.isOpen())
    if (currOpenDropdown) {
      // let dropdown = this.dropdowns.find(d => (d as any)._elementRef.nativeElement == drop)
      if (dropdown) {
        currOpenDropdown.close();
        dropdown.open();
      }
    }
  }

  ngOnInit() {
    this.updateTitle();

    this.content.valueChanges.subscribe(value => {
      this.changedContent = this.currContent !== value;
      this.currContent = value;
      this.updateTitle();
    });
  }

  ngAfterViewInit() {
    let elemStyle = this.textarea.nativeElement.style;
    elemStyle.fontSize = this.INITIAL_FONT_SIZE + 'px';
    elemStyle.fontFamily = this.INITIAL_FONT_FAMILY;
  }

  checkIfWantToSaveChanges() {
    if (this.changedContent) {
      let modalRef = this.modalService.open(ConfirmModalComponent);
      let modalComp = modalRef.componentInstance as ConfirmModalComponent;

      let tmpPath = this.path ? this.path : 'new file';
      modalComp.body = `Do you wish to save '${tmpPath}'?`;

      return modalRef.result;
    }

    return new Promise((resolve, reject) => resolve(ConfirmEvent.NO));
  }

  clear() {
    this.path = "";
    this.changedContent = false;
    this.content.setValue("");
    this.updateTitle();
    this.textarea.nativeElement.focus();
  }

  // https://alligator.io/angular/binding-keyup-keydown-events/
  @HostListener("window:keydown.control.n")
  newFile() {
    // https://javascript.info/promise-chaining
    this.checkIfWantToSaveChanges()
      .then(result => { if(result === ConfirmEvent.YES) this.save(); } )
      .then(() => this.clear())
      .catch(() => console.log("dismiss new file action!"));
  }

  private _openFile() {
    let options = {
      title: "Open file",
      defaultPath: "",
      buttonLabel: "Open",

      filters: [
        { name: 'txt', extensions: ['txt',] },
        { name: 'All Files', extensions: ['*'] }
      ]
    }

    // https://www.electronjs.org/docs/api/remote#remotegetcurrentwindow
    let path = this.dialog.showOpenDialogSync(this.remote.getCurrentWindow(), options);
    if (path) {
      console.log(path[0]);
      // https://nodejs.org/api/fs.html
      this.efs.readFile(path[0], 'utf-8', (err, data) => {
        if (err) {
          alert("Err0r while reading the file:" + err.message);
          return;
        }

        console.log("content = " + data);
        this.currContent = data;
        this.content.setValue(data);
        this.setFilePath(path[0]);
        this.textarea.nativeElement.focus();
      });
    }
  }

  @HostListener("window:keydown.control.o")
  openFile() {
    this.checkIfWantToSaveChanges()
      .then(result => { if(result == ConfirmEvent.YES) this.save(); })
      .then(() => this._openFile())
      .catch(() => console.log("dismiss open file action!"));
  }

  @HostListener("window:keydown.control.s")
  save() {
    if (this.path) {
      this.saveContent(this.content.value, this.path);
    } else {
      this.saveAs();
    }
  }

  saveAs() {
    let options = {
      title: "Save file",
      defaultPath: "",
      buttonLabel: "Save",

      filters: [
        { name: 'txt', extensions: ['txt',] },
        { name: 'All Files', extensions: ['*'] }
      ]
    }

    let path = this.dialog.showSaveDialogSync(this.remote.getCurrentWindow(), options);

    if (path) {
      this.saveContent(this.content.value, path);
    }
  }

  saveContent(conent: string, path: string) {
    this.changedContent = false;
    this.setFilePath(path);
    console.log(path);
    console.log("content = " + this.content.value);

    this.efs.writeFile(path, this.content.value, (err) => {
      if (err) {
        alert("File not saved! " + err.message);
      }
    });

    this.textarea.nativeElement.focus();
  }

  updateTitle() {
    let title = "new file"
    if (this.path) {
      title = this.path + (this.changedContent ? '*' : '');
    }
    console.log("title = " + title);
    this.titleService.setTitle(`${title} - ngedit`);
  }

  setFilePath(path) {
    this.path = path;
    this.updateTitle();
  }

  openFormatFont() {
    let elStyle = this.textarea.nativeElement.style;
    let font = elStyle.fontSize;
    font = font ? font.replace('px', '') : this.INITIAL_FONT_SIZE;

    let family = elStyle.fontFamily;
    family = family ? family.replace(/"/g, '') : this.INITIAL_FONT_FAMILY;

    console.log("font family = " + family)

    let modalRef = this.modalService.open(FormatModalComponent);
    let modalComp = modalRef.componentInstance as FormatModalComponent;
    modalComp.fontSize.setValue(font);
    modalComp.fontFamily.setValue(family);

    modalComp.size$.subscribe(size => {
      this.textarea.nativeElement.style.fontSize = size + 'px';
    });
    modalComp.family$.subscribe(family => {
      this.textarea.nativeElement.style.fontFamily = family;
    });
  }


}
