import {
    Component, Output, EventEmitter, Input
  } from '@angular/core';
  
  @Component({
    selector: 'tile',
    templateUrl: './tile.component.html'
  })
  export class TileComponent {
    @Input() test: string;
    @Output() testEmit = new EventEmitter<any>();
    clicked(data: string) {
      this.testEmit.emit(data);
    }
  }