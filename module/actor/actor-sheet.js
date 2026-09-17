export class CharacterSheet extends foundry.appv1.sheets.ActorSheet {

  /** Default sheet options */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["aerakai", "sheet", "actor"],
      template: "systems/aerakai/templates/actors/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "attributes"
        }
      ]
    });
  }

  /** Prepare data for the sheet */
  async getData(options) {
    const data = await super.getData(options);

    // Items nach Typ gruppieren
    data.abilities = data.items.filter(i => i.type === "ability");

    console.log("Aera:Kai | Sheet getData() für:", this.actor.name);
    console.log("Aera:Kai | Sheet-Daten:", foundry.utils.deepClone(data.actor.system));

    return data;
  }

  /** Activate sheet listeners */
  activateListeners(html) {
    super.activateListeners(html);

    const editMode = this.actor.getFlag("aerakai", "editMode") ?? false;

    // --- Edit Mode Toggle ---
    html.find(".edit-mode-toggle").on("change", ev => {
      const enabled = ev.currentTarget.checked;
      this.actor.setFlag("aerakai", "editMode", enabled);
      this.render();
    });

    // --- Attribute: klickbar im View-Mode ---
    html.find('input[name^="system.attributes"]').each((i, el) => {
      if (!editMode) {
        el.setAttribute("disabled", true);
        el.addEventListener("click", () => {
          console.log("geklickt:", el.name);
        });
      } else {
        el.removeAttribute("disabled");
      }
    });

    // --- Fähigkeiten: klickbar im View-Mode ---
    html.find(".tab[data-tab='abilitys'] li").each((i, el) => {
      if (!editMode) {
        el.addEventListener("click", () => {
          console.log("geklickt:", el.innerText);
        });
      }
    });

    // --- Hintergrund ---
    html.find('input[name^="system.background"]').each((i, el) => {
      if (!editMode) {
        el.setAttribute("disabled", true);
      } else {
        el.removeAttribute("disabled");
      }
    });

    // --- Ressourcen: Value immer editierbar, Max nur im Edit-Mode ---
    html.find(".resource-fields input").each((i, el) => {
      const name = el.name;
      const isValueField = name.endsWith(".value");

      if (!editMode && !isValueField) {
        el.setAttribute("disabled", true);
      } else {
        el.removeAttribute("disabled");
      }
    });

    // --- Update-Logik ---
    html.find('input[type="number"], input[type="text"]').on("change", ev => {
      const input = ev.currentTarget;
      const path = input.name;
      const value = input.type === "number" ? Number(input.value) : input.value;

      console.log("Aera:Kai | Update ausgelöst:", path, "→", value);

      const parts = path.split(".");
      const last = parts.pop();
      const basePath = parts.join(".");
      const sysPath = parts.slice(1).join(".");
      const baseObj = foundry.utils.getProperty(this.actor.system, sysPath);
      const newObj = { ...baseObj, [last]: value };

      // Ressourcen
      if (parts[1] === "resources") {
        const allResources = foundry.utils.deepClone(this.actor.system.resources);
        const key = parts[2];
        allResources[key] = newObj;
        this.actor.update({ "system.resources": allResources });
        return;
      }

      // Attribute
      if (parts[1] === "attributes") {
        const allAttributes = foundry.utils.deepClone(this.actor.system.attributes);
        const key = parts[2];
        allAttributes[key] = value;
        this.actor.update({ "system.attributes": allAttributes });
        return;
      }

      // Hintergrund
      if (parts[1] === "background") {
        const allBackground = foundry.utils.deepClone(this.actor.system.background);
        const key = parts[2];
        allBackground[key] = value;
        this.actor.update({ "system.background": allBackground });
        return;
      }
    });

  }
}
