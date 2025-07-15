import { ObjectKind } from "../enums";
import { Model } from "./Model";

export class Obj extends Model {
  protected _name: string;         // Object name, e.g. "bottle of water"
  protected _description: string;  // Object description, e.g. "This bottle gleams in the light..."
  protected _data: string;         // Data about this object
  protected _content: Obj[];       // Objects contained within this object
  protected _kind: ObjectKind;     // Kind of object
  protected _symbol: string;       // Symbol to use on the map
  protected _color: string;        // Color of symbol on the map

  constructor() {
    super();
    this._name = "Object";         // Default Obj name
    this._type = "Object";
    this._description = "";
    this._data = "";
    this._symbol = "♪"
    this._kind = ObjectKind.Note;  // Default Obj type
    this._content = [];            // No subobjects
  }

  /**
   * Load an Obj from a POJO from a JSON source.
   * @param settings Map settings
   * @param src POJO
   */    
  static load(src: object): Obj {
    // Create new Obj:
    let obj = new Obj();
    // Copy fields from POJO into Obj:
    for(let key in src) {
      // Content field is special. Pass it to Obj's POJO loader recursively,
      // to create subobjects.
      if(key == '_content') { 
        obj._content = (src as any)._content.map((x:object) => Obj.load(x));
      } else {
        (obj as any)[key] = (src as any)[key];
      }
    }
    return obj;
  }

  /**
   * Return the object's name, e.g. "Twisty Passage"
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Set the object's name, e.g. "Twisty Passage"
   */
  public set name(value: string) {
    this._name = value;
    this.setDirty();
  }

  /**
   * Return the object's description
   */
  public get description(): string {
    return this._description;
  }

  /**
   * Set the object's description
   */
  public set description(value: string) {
    this._description = value;
    this.setDirty();
  }

  /**
   * Return the object's symbol
   */
  public get symbol(): string {
    return this._symbol;
  }

  /**
   * Set the object's symbol
   */
  public set symbol(value: string) {
    this._symbol = value;
    this.setDirty();
  }

  /**
   * Return the object's symbol
   */
  public get data(): string {
    return this._data;
  }

  /**
   * Set the object's symbol
   */
  public set data(value: string) {
    this._data = value;
    this.setDirty();
  }

  /**
   * Return the object's symbol
   */
  public get color(): string {
    return this._color;
  }

  /**
   * Set the object's symbol
   */
  public set color(value: string) {
    this._color = value;
    this.setDirty();
  }

  /**
   * Returns a list of objects contained in this object.
   */
  public get content(): Obj[] {
    return this._content;
  }

  /**
   * Set the list of objects cotained in this object.
   */
  public set content(value: Obj[]) {
    this._content = value;
    this.setDirty();
  }
  
  /**
   * Return the kind of this object
   * @returns ObjectKind
   */
  public get kind(): ObjectKind {
    return this._kind;
  }

  /**
   * Set the kind of this object
   */
  public set kind(value: ObjectKind) {
    this._kind = value;
    this.setDirty();
  }  
}