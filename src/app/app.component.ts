import {
  Component, ViewChild, OnDestroy,
  Compiler, ViewContainerRef, NgModule, AfterContentInit, OnInit
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { GridComponent } from './grid.component';

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterContentInit, OnDestroy, OnInit {
  @ViewChild('grid', { read: ViewContainerRef }) grid: ViewContainerRef;

  items = [
    '111',
    '222',
    '333'
  ];
  testEmitValue = 'Nothing emitted'

  htmlForm: FormGroup;
  tileCode: string;
  gridCode: string;
  editorOptions: any = { formatOnType: true, scrollBeyondLastLine: false, readOnly: true, theme: 'vs', glyphMargin: false, folding: false, scrollbar: { vertical: 'hidden', handleMouseWheel: false }, minimap: { enabled: false }, automaticLayout: true };

  constructor(
    private compiler: Compiler) { }

  ngOnInit(): void {
    this.tileCode = `<div style="border: solid; border-color:blue"><p (click)="clicked(test)" style="cursor:pointer">Click me! {{test}}</p></div>`;
    this.gridCode = `<div style="display: grid; grid-template-columns: 100px 100px 100px; grid-gap: 20px;"><ng-template #tiles></ng-template></div>`;
    this.createHtmlForm();
  }

  ngOnDestroy() {
    if (this.grid) {
      this.grid.clear();
    }
  }

  async ngAfterContentInit() {
    await this.compileGrid();
  }

  private async compileGrid(): Promise<any> {
    if (this.grid) {
      this.grid.clear();
    }

    const code = this.htmlForm?.get('gridCode')?.value ? this.htmlForm.get('gridCode').value : this.gridCode;
    const tileCode = this.htmlForm?.get('tileCode')?.value ? this.htmlForm.get('tileCode').value : this.tileCode;
    const tmpCmp = Component({ template: code })(GridComponent)
    const tmpModule = NgModule({ declarations: [tmpCmp] })(class {
    });

    await this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
      .then((factories) => {
        const f = factories.componentFactories[0];
        const cmpRef = this.grid.createComponent(f);
        cmpRef.instance.tileCode = tileCode;
        cmpRef.instance.items = this.items;
        cmpRef.instance.itemClicked.subscribe(data => {
          this.testEmitValue = data;
        })
        return cmpRef;
      })
  }

  async save() {
    await this.compileGrid();
  }

  createHtmlForm() {
    this.htmlForm = new FormGroup({
      tileCode: new FormControl(this.tileCode),
      gridCode: new FormControl(this.gridCode),
    });
  }
}