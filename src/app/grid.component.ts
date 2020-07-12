import {
    Component, ViewChild, ViewContainerRef, AfterContentInit, Compiler, NgModule, Input, Output, EventEmitter
} from '@angular/core';
import { TileComponent } from './tile.component';

@Component({
    selector: 'grid',
    templateUrl: './grid.component.html'
})
export class GridComponent implements AfterContentInit {
    @ViewChild('tiles', { read: ViewContainerRef }) tiles: ViewContainerRef;
    @Input() tileCode: string;
    @Input() items: [];
    @Output() itemClicked: EventEmitter<string> = new EventEmitter<string>();

    constructor(
        private compiler: Compiler) {
    }

    async ngAfterContentInit() {
        await this.compileTiles();
    }

    private async compileTiles(): Promise<any> {
        if (this.tiles) {
            this.tiles.clear();
        }

        const code = this.tileCode;
        const tmpCmp = Component({ template: code })(TileComponent);
        const tmpModule = NgModule({ declarations: [tmpCmp] })(class {
        });

        await this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
            .then((factories) => {
                const f = factories.componentFactories[0];
                this.items.forEach(item => {
                    const cmpRef = this.tiles.createComponent(f);
                    cmpRef.instance.test = item;
                    cmpRef.instance.testEmit.subscribe(data => {
                        this.itemClicked.emit(`${data} just emitted!`);
                    })
                    return cmpRef;
                });
            })
    }
}