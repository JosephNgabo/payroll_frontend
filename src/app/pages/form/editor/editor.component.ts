import { Component, OnInit } from '@angular/core';
import { Editor } from 'ngx-editor';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})

/**
 * Form-editor component
 */
export class EditorComponent implements OnInit {

  editor: Editor;
  html = '<p>Content of the editor.</p>';

  // bread crumb items
  breadCrumbItems: Array<{}>;

  constructor() { }

  ngOnInit() {
    this.editor = new Editor();
    this.breadCrumbItems = [{ label: 'Forms' }, { label: 'Form Editor', active: true }];
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }
}
