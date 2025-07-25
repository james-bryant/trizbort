import {Control, IdPopup, IdInput, IdTextarea, IdColorPicker} from "../";
import { ObjectKind } from "../../enums";
import { Obj } from "../../models";

export class IdObjectEditor extends Control {
  private ctrlName: IdInput;
  private ctrlDescription: IdInput;
  private ctrlSymbol: IdInput;
  private ctrlColor: IdInput;
  private colorPickerPopup: IdColorPicker; // Separate color picker for popup
  private ctrlData: IdTextarea;
  private obj: Obj;
  private btnDelete: HTMLElement;
  private btnNote: IdPopup;
  private btnKey: IdPopup;
  private btnDoor: IdPopup;
  private btnActor: IdPopup;
  private btnItem: IdPopup;
  private btnScenery: IdPopup;
  private static dragParent: HTMLElement;
  private static dragObj: Obj;
  private dropDiv: HTMLElement;
  private dropAsChildDiv: HTMLElement;

  //
  // Create a new instance of IdObjectEditor by providing a query selector that
  // yields an id-object-editor element.
  //
  constructor(elem: HTMLElement|string, base?: HTMLElement) {
    super(elem, base);

    // Expand a handlebars template into the top element.
    this.elem.innerHTML = Handlebars.templates.idObjectEditor({ });

    // The drag handle is used to initiate dragging. When
    // the mouse is pressed on it, set the 'draggable' attribute
    // on the object editor.
    let handle:HTMLDivElement = this.elem.querySelector('.handle');
    handle.addEventListener('mousedown', (e) => {
      this.elem.setAttribute('draggable', 'true');
    });
    handle.addEventListener('mouseup', (e) => {
      this.elem.setAttribute('draggable', 'false');
    });

    // Object editor dragstart and dragend:
    this.elem.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text', 'foo');
      IdObjectEditor.dragObj = this.obj;
      IdObjectEditor.dragParent = this.elem.parentElement;
      this.elem.classList.add('dragged');
      IdObjectEditor.dragParent.classList.add('dragging');
    });
    this.elem.addEventListener('dragend', (e) => {
      this.elem.setAttribute('draggable', 'false'); // Editor must not remain draggable
      this.elem.classList.remove('dragged');
      IdObjectEditor.dragParent.classList.remove('dragging');
    });

    this.dropDiv = this.elem.querySelector('.drop');
    this.dropAsChildDiv = this.elem.querySelector('.drop-child');
    let me = this;

    this.dropDiv.addEventListener('dragover', (e) => { return this.handleDragOver(e); }, false);
    this.dropAsChildDiv.addEventListener('dragover', (e) => { return this.handleDragOver(e); }, false);

    this.dropDiv.addEventListener('dragenter', function(e) { return me.handleDragEnter(this); });
    this.dropAsChildDiv.addEventListener('dragenter', function(e) { return me.handleDragEnter(this); });

    this.dropDiv.addEventListener('dragleave', function(e) { return me.handleDragLeave(this); });
    this.dropAsChildDiv.addEventListener('dragleave', function(e) { return me.handleDragLeave(this); });

    this.dropDiv.addEventListener('drop', function(e) { return me.handleDrop(e, this); });
    this.dropAsChildDiv.addEventListener('drop', function(e) { return me.handleDropAsChild(e, this); });

    // Text inputs:
    this.ctrlName = new IdInput('.js-name', this.elem).addEventListener('input', () => { this.obj.name = this.ctrlName.value; });
    this.ctrlDescription = new IdInput('.js-description', this.elem).addEventListener('input', () => { this.obj.description = this.ctrlDescription.value; });
    this.ctrlSymbol = new IdInput('.js-symbol', this.elem).addEventListener('input', () => { this.obj.symbol = this.ctrlSymbol.value; });
    this.ctrlData = new IdTextarea('.js-data', this.elem).addEventListener('input', () => { this.obj.data = this.ctrlData.value; });

    // Color input:
    this.ctrlColor = new IdInput('.js-color', this.elem).addEventListener('change', () => { this.obj.color = this.ctrlColor.value; });

    // Create color picker button manually if it doesn't exist in template
    let colorPickerBtn = this.elem.querySelector('.js-color-picker-btn');
    if (!colorPickerBtn) {
      // Create the button and input group manually
      const colorInput = this.elem.querySelector('.js-ctrl-color');
      if (colorInput && colorInput.parentElement) {
        // Wrap the input in a div with input-group class
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        // Create the button
        colorPickerBtn = document.createElement('button');
        colorPickerBtn.className = 'btn btn-secondary js-color-picker-btn';
        colorPickerBtn.textContent = '🎨';

        // Style the input group
        inputGroup.style.cssText = 'display: flex; align-items: stretch;';

        // Style the input to connect with button
        const inputElement = colorInput.querySelector('input');
        if (inputElement) {
          inputElement.style.cssText = 'border-radius: 4px 0 0 4px; border-right: none;';
        }

        // Insert the input group after the color input
        colorInput.parentElement.insertBefore(inputGroup, colorInput.nextSibling);

        // Move the color input into the group and add the button
        inputGroup.appendChild(colorInput);
        inputGroup.appendChild(colorPickerBtn);
      }
    }

    // Color picker button handler
    if (colorPickerBtn) {
      colorPickerBtn.addEventListener('click', () => { this.openColorPickerPopup(); });
    }


    // Delete button:
    this.btnDelete = this.elem.querySelector('a');
    this.btnDelete.addEventListener('click', () => { this.delete(); });

    // Object type buttons:
    this.btnNote = new IdPopup('.js-note', this.elem).addEventListener('click', () => { this.setKind(ObjectKind.Note); }) as IdPopup;
    this.btnKey = new IdPopup('.js-key', this.elem).addEventListener('click', () => { this.setKind(ObjectKind.Key); }) as IdPopup;
    this.btnDoor = new IdPopup('.js-door', this.elem).addEventListener('click', () => { this.setKind(ObjectKind.Door); }) as IdPopup;
    this.btnItem = new IdPopup('.js-item', this.elem).addEventListener('click', () => { this.setKind(ObjectKind.Item); }) as IdPopup;
    this.btnScenery = new IdPopup('.js-scenery', this.elem).addEventListener('click', () => { this.setKind(ObjectKind.Scenery); }) as IdPopup;
    this.btnActor = new IdPopup('.js-actor', this.elem).addEventListener('click', () => { this.setKind(ObjectKind.Actor); }) as IdPopup;
  }

  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  private handleDragEnter(elem: HTMLElement) {
    elem.classList.add('over');
  }

  private handleDragLeave(elem: HTMLElement) {
    elem.classList.remove('over');
  }

  private handleDrop(e: Event, elem: HTMLElement) {
    e.preventDefault();
    e.stopPropagation();
    let evt = new CustomEvent('drop', { detail: IdObjectEditor.dragObj });
    this.elem.dispatchEvent(evt);
    return false;
  }

  private handleDropAsChild(e: Event, elem: HTMLElement) {
    e.preventDefault();
    e.stopPropagation();
    let evt = new CustomEvent('dropAsChild', { detail: IdObjectEditor.dragObj });
    this.elem.dispatchEvent(evt);
    return false;
  }  

  private setKind(kind: ObjectKind) {
    this.btnNote.selected = kind == ObjectKind.Note;
    this.btnKey.selected = kind == ObjectKind.Key;
    this.btnDoor.selected = kind == ObjectKind.Door;
    this.btnActor.selected = kind == ObjectKind.Actor;
    this.btnItem.selected = kind == ObjectKind.Item;
    this.btnScenery.selected = kind == ObjectKind.Scenery;
    this.obj.kind = kind;
  }

  set value(obj: Obj) {
    this.obj = obj;
    this.ctrlName.value = obj.name;
    this.ctrlDescription.value = obj.description;
    this.ctrlData.value = obj.data;
    this.ctrlSymbol.value = obj.symbol;
    this.ctrlColor.value = obj.color;
    this.setKind(obj.kind);
  }    

  get value(): Obj {
    return this.obj;
  }

  private delete() {
    let evt = new CustomEvent('delete');
    this.elem.dispatchEvent(evt);    
  }
  // Open color picker popup for the ctrlColor field
  openColorPickerPopup() {
    // Create a popup container
    const popupContainer = document.createElement('div');
    popupContainer.style.position = 'fixed';
    popupContainer.style.top = '25%';
    popupContainer.style.left = '25%';
    // popupContainer.style.transform = 'translate(-50%, -50%)';
    popupContainer.style.background = '#fff';
    popupContainer.style.border = '1px solid #ccc';
    popupContainer.style.borderRadius = '8px';
    popupContainer.style.padding = '20px';
    popupContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    popupContainer.style.zIndex = '10000';
    popupContainer.style.minWidth = '300px';

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.style.position = 'flex';
    // backdrop.style.top = '0';
    // backdrop.style.left = '0';
    // backdrop.style.width = '100%';
    // backdrop.style.height = '100%';
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    backdrop.style.zIndex = '9999';

    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Select Color';
    title.style.margin = '0 0 15px 0';
    popupContainer.appendChild(title);

    // Create color picker container
    const colorPickerContainer = document.createElement('div');
    colorPickerContainer.innerHTML = '<id-colorpicker class="popup-color-picker"></id-colorpicker>';
    popupContainer.appendChild(colorPickerContainer);

    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'flex-end';
    buttonsContainer.style.gap = '10px';
    buttonsContainer.style.marginTop = '20px';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'btn btn-secondary';

    const okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.className = 'btn btn-primary';

    buttonsContainer.appendChild(cancelBtn);
    buttonsContainer.appendChild(okBtn);
    popupContainer.appendChild(buttonsContainer);

    // Add to document
    document.body.appendChild(backdrop);
    document.body.appendChild(popupContainer);

    // Initialize color picker
    this.colorPickerPopup = new IdColorPicker('.popup-color-picker', popupContainer);

    // Set current value if any
    if (this.ctrlColor.value) {
      this.colorPickerPopup.color = this.ctrlColor.value;
    }

    // Close popup function
    const closePopup = () => {
      document.body.removeChild(backdrop);
      document.body.removeChild(popupContainer);
    };

    // Event handlers
    cancelBtn.addEventListener('click', closePopup);
    backdrop.addEventListener('click', closePopup);

    okBtn.addEventListener('click', () => {
      // Get hex color and set it to the input field
      const selectedColor = this.colorPickerPopup.color;
      this.ctrlColor.value = selectedColor;
      closePopup();
    });

    // Focus on OK button
    okBtn.focus();
  }

}