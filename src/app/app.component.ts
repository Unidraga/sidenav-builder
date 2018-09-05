import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Modeler, OriginalPropertiesProvider, PropertiesPanelModule, InjectionNames, OriginalPaletteProvider } from "./bpmn-js/bpmn-js";
import { CustomPropsProvider } from './props-provider/CustomPropsProvider';
import { CustomPaletteProvider } from "./props-provider/CustomPaletteProvider";
import * as xml2js from 'xml2js';
import { Workflow } from './shared/data/workflow';
import { WorkflowService } from './shared/services/workflow.service';

const customModdle = {
  name: "customModdle",
  uri: "http://example.com/custom-moddle",
  prefix: "custom",
  xml: {
    tagAlias: "lowerCase"
  },
  associations: [],
  types: [
    {
      "name": "ExtUserTask",
      "extends": [
        "bpmn:UserTask"
      ],
      "properties": [
        {
          "name": "worklist",
          "isAttr": true,
          "type": "String"
        }
      ]
    },
  ]
};

const customAttrKey = 'attr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Angular/BPMN';
  modeler;

  diagramName: string;
  diagramNameList: Array<any>;
  diagramListMap: Map<string, any>;
  selectedDiagram: any;

  constructor(private http: HttpClient, private workflowService: WorkflowService) {
  }

  ngOnInit(): void {
    this.modeler = new Modeler({
      container: '#canvas',
      width: '100%',
      height: '600px',
      additionalModules: [
        PropertiesPanelModule,

        // Re-use original bpmn-properties-module, see CustomPropsProvider
        { [InjectionNames.bpmnPropertiesProvider]: ['type', OriginalPropertiesProvider.propertiesProvider[1]] },
        { [InjectionNames.propertiesProvider]: ['type', CustomPropsProvider] },

        // Re-use original palette, see CustomPaletteProvider
        { [InjectionNames.originalPaletteProvider]: ['type', OriginalPaletteProvider] },
        { [InjectionNames.paletteProvider]: ['type', CustomPaletteProvider] },
      ],
      propertiesPanel: {
        parent: '#properties'
      },
      moddleExtension: {
        custom: customModdle
      }
    });

    this.newDiagram();
    this.updateDiagrams();
  }

  handleError(err: any) {
    if (err) {
      console.warn('Ups, error: ', err);
    }
  }

  updateDiagrams() {
    this.diagramListMap = new Map<string, any>();

    this.workflowService.getDiagrams().subscribe(data => {
      const dataArray = data as Array<any>;
      // get names
      dataArray.forEach(element => {
        this.diagramListMap.set(element['name'], element);
      });

      this.diagramNameList = Array.from(this.diagramListMap.keys());
    });
  }

  newDiagram(): void {
    const url = '/assets/bpmn/initial.bpmn';
    this.http.get(url, {
      headers: { observe: 'response' }, responseType: 'text'
    }).subscribe(
      (x: any) => {
        console.log('Fetched XML, now importing: ', x);
        this.modeler.importXML(x, this.handleError);
      },
      this.handleError
    );
  }

  save(): void {
    this.modeler.saveXML((err: any, xml: any) => {
      console.log('Result of saving XML: ', err, xml);

      let json = '';

      // const parser = new xml2js.Parser({attrkey: 'attr'});
      const parser = new xml2js.Parser({ attrkey: customAttrKey });
      parser.parseString(xml, function (err, result) {
        console.log(result);
        json = result;
      });

      this.appendMongoAttributes(json);
      const string = JSON.stringify(json);

      // pass diagram json to server.js
      const dd = new Workflow;
      dd.name = this.diagramName;
      dd.value = string;
      console.log(dd);

      this.workflowService.saveDiagram(dd).subscribe(val => {
        // check for success
        this.updateDiagrams();
      },
        error => {
          console.log('Error: ' + error);
        }
      );
    });
  }

  load(selectedDiagramName: string) {
    let json = this.diagramListMap.get(selectedDiagramName);

    json = this.removeMongoAttributes(json);
    console.log(json);

    const builder = new xml2js.Builder({attrkey: customAttrKey});
    const xml = builder.buildObject(json);
    console.log(xml);
    
    this.modeler.importXML(xml, function(result) {
      console.log(result);
    });
  }

  private appendMongoAttributes(json: any): any {
    // add diagram name
    const nameKey = 'name';
    const nameValue = this.diagramName;
    json[nameKey] = nameValue;

    // add creation date
    const dateKey = 'creationDate';
    const dateValue = Date.now();
    json[dateKey] = dateValue;

    const typeKey = 'diagramType';
    const typeValue = 'BPMN';
    json[typeKey] = typeValue;

    return json;
  }

  private removeMongoAttributes(json: any): any {
    delete json['_id'];
    delete json['name'];
    delete json['creationDate'];
    delete json['diagramType'];
    return json;
  }
}
