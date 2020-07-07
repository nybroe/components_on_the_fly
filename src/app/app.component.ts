import {
  Component, ViewChild, OnDestroy,
  Compiler, ViewContainerRef, NgModule, AfterContentInit, OnInit
} from '@angular/core';
import { TileComponent } from './tile.component'
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterContentInit, OnDestroy, OnInit {
  @ViewChild('vc', { read: ViewContainerRef }) vc: ViewContainerRef;

  private cmpRef;
  
  items = [
    '111',
    '222',
    '333'
  ];
  testEmitValue = 'Nothing emitted'
  
  htmlForm: FormGroup;
  htmlCode: string;
  editorOptions: any = { formatOnType: true, scrollBeyondLastLine: false, readOnly: true, theme: 'vs', glyphMargin: false, folding: false, scrollbar: { vertical: 'hidden', handleMouseWheel: false }, minimap: { enabled: false }, automaticLayout: true };

  constructor(
    private compiler: Compiler) { }

  ngOnInit(): void {
    this.htmlCode = `<div style="border: solid; border-color:blue"><p (click)="clicked(test)" style="cursor:pointer">Click me! {{test}}</p></div>`;
    this.createHtmlForm();
  }

  ngOnDestroy() {
    if (this.vc) {
      this.vc.clear();
    }
  }

  ngAfterContentInit() {
    this.addComponent();
  }

  private addComponent() {
    if (this.vc) {
      this.vc.clear();
    }

    const code = this.htmlForm?.get('htmlCode')?.value ? this.htmlForm.get('htmlCode').value : this.htmlCode;
    const tmpCmp = this.getCompByNamespace('lets.do.it', code);
    const tmpModule = NgModule({ declarations: [tmpCmp] })(class {
    });

    this.cmpRef = this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
      .then((factories) => {
        const f = factories.componentFactories[0];
        this.items.forEach(item => {
          const cmpRef = this.vc.createComponent(f);
          cmpRef.instance.test = item;
          cmpRef.instance.testEmit.subscribe(data => {
            this.testEmitValue = `${data} just emitted!`;
          })
        });
      })
  }

  save() {
    this.addComponent();
  }

  createHtmlForm() {
    this.htmlForm = new FormGroup({
      htmlCode: new FormControl(this.htmlCode),
    });
  }

  getCompByNamespace(namespace: string, template: string) {
    if (namespace == 'lets.do.it') {
      return Component({ template: template })(TileComponent);
    }
  }
}