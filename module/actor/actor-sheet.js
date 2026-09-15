export class CharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["aerakai", "sheet", "actor"],
      template: "systems/aerakai/templates/actors/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
    });
  }

  getData() {
    const data = super.getData();
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Beispiel: Klick-Listener für später
    // html.find(".roll-attribute").click(ev => this._onRollAttribute(ev));
  }
}
