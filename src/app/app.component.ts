import { Component, ViewChild, ElementRef, HostListener, QueryList, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NgbActiveModal, NgbModal, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { of } from 'rxjs';

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

  @ViewChild('textarea') textarea: ElementRef;

  content = new FormControl();
  path = "";

  constructor(
    private titleService: Title,
    private modalService: NgbModal,
  ) 
  {

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

  ngOnInit() {
    this.updateTitle();

    this.content.valueChanges.subscribe(value => {
      this.changedContent = this.currContent !== value;
      this.currContent = value;
      this.updateTitle();
    });
  }

  checkIfWantToSaveChanges() {
    if (this.changedContent) {
      let modalRef = this.modalService.open(ConfirmModalComponent);
      let modalComp = modalRef.componentInstance as ConfirmModalComponent;
      
      let tmpPath = this.path ? this.path : 'new file';
      modalComp.body = `Do you with to save '${tmpPath}'?`;

      return modalComp.result;
    }

    return of(0);
  }

  clear() {
    this.path = "";
    this.changedContent = false;
    this.content.setValue("");
    this.updateTitle();  
  }

  // https://alligator.io/angular/binding-keyup-keydown-events/
  @HostListener("window:keydown.control.n")
  newFile() {
    let result = this.checkIfWantToSaveChanges();
    result.subscribe(value => {
      console.log("RESULT = " + value)
      if(value == 1) {
        this.save();
      }

      if(value != -1) {
        this.clear();
        this.textarea.nativeElement.focus();
      }
    })

    
  }

  @HostListener("window:keydown.control.o")
  openFile() {

    let result = this.checkIfWantToSaveChanges();
    result.subscribe(value => {
      console.log("RESULT = " + value)
      if(value == 1) {
        this.save();
      }

      if(value != -1) {

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
    });
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

}
