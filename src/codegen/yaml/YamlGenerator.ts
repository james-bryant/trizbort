import { Map } from "../../models";
import { Direction, ObjectKind, ConnectorType } from "../../enums";
import { CodeGenerator } from "../CodeGenerator";

export class YamlGenerator extends CodeGenerator {
  
  constructor(map: Map) {
    super(map); 
    Handlebars.registerHelper('className', (name:string) => { return this.yamlClassName(name); });
    Handlebars.registerHelper('dirToStr', (dir:Direction, type:ConnectorType) => { return this.dirToStr(dir, type); }); 
    Handlebars.registerHelper('kindToStr', (kind:ObjectKind) => { return this.kindToStr(kind); }); 
    Handlebars.registerPartial('DescriptionPartial', Handlebars.templates.yamlDescription);
    Handlebars.registerPartial('yamlObject', Handlebars.templates.yamlObject);
  }

  protected kindToStr(dir: ObjectKind): string {
    switch(dir) {
      case ObjectKind.Note:    return "note"
      case ObjectKind.Key:     return "key"
      case ObjectKind.Door:    return "door"
      case ObjectKind.Actor:   return "actor";
      case ObjectKind.Item:    return "item";
      case ObjectKind.Scenery: return "decoration";
      default: return "";
    }     
  }

  protected yamlClassName(name: string): string {
    // Remove diacritics and special characters, then convert to camelCase
    return name.replace(" ", "_");
  }
  public generate() : string {
    return Handlebars.templates.yaml({ map: this.map });
  }
}