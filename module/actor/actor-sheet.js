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

    // --- Edit Mode Switch ---
    html.find('input.edit-mode-switch').on("change", ev => {
      const enabled = ev.currentTarget.checked;
      this.actor.setFlag("aerakai", "editMode", enabled);
      this.render();
    });

	// --- Attribute Buttons im View-Mode ---
	html.find(".attr-btn").on("click", async ev => {
	  const attr = ev.currentTarget.dataset.attr;
	  const val = this.actor.system.attributes[attr];

	  // Anzahl der Würfel berechnen
	  const diceCount = 2 + val;

	  // Fertige Formel erzeugen
	  const roll = new Roll(`${diceCount}d6`);

	  await roll.evaluate();

	  createAnimeRollCard(roll, `Attributswurf: ${attr.toUpperCase()}`);
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

// --- Roll Card ---
function createAnimeRollCard(roll, title) {
  const diceResults = roll.terms[0].results.map(r => r.result).sort((a, b) => a - b);
  
  const seperated = findChains(diceResults);
  
  const chains = seperated.filter(c => c.length > 1).sort((a, b) => b.length - a.length);
  const singles = seperated.filter(c => c.length === 1);
  
  const pasches = groupSinglesToPasche(singles).sort((a, b) => b.length - a.length);
  const criticalPasches = pasches.filter(p => p.length > 2);
  const rest = pasches.filter(p => p.length < 3);
  
  const stagesOfSuccess = getStagesOfSuccess(chains, criticalPasches);
  const successWording = getSuccessOutput(stagesOfSuccess);

  const content = `
    <div class="aerakai-roll-card anime-style">
      <div class="header">
        <span class="title">${title}</span>
      </div>
	  </br>
      <div class="chains">
        ${chains.map(chain => `
          <div class="chain">
            ${chain.map(v => `
              <div class="die">
                <span>${v}</span>
              </div>
            `).join("")}
          </div>
        `).join("")}
      </div>
	  
	  <div class="criticalPasches">
        ${criticalPasches.map(pasch => `
          <div class="pasch">
            ${pasch.map(v => `
              <div class="die">
                <span>${v}</span>
              </div>
            `).join("")}
          </div>
        `).join("")}
      </div>
	  
	  <div class="rest">
        ${rest.map(dice => `
          <div class="dice">
            ${dice.map(v => `
              <div class="die">
                <span>${v}</span>
              </div>
            `).join("")}
          </div>
        `).join("")}
      </div>
	  
      <div class="footer">
		<span class="sum-label">Erfolgsstufen: </span>
		<span class="sum-value">${stagesOfSuccess}</span>
		</br>
        <span class="sum-label">${successWording}</span>
      </div>
    </div>
  `;

  ChatMessage.create({
    speaker: ChatMessage.getSpeaker(),
    content
  });
}

function findChains(values) {
  const chains = [];
  const used = new Array(values.length).fill(false);

  for (let i = 0; i < values.length; i++) {
    if (used[i]) continue;

    const chain = [values[i]];
    used[i] = true;

    let last = values[i];

    for (let j = i + 1; j < values.length; j++) {
      if (!used[j] && values[j] === last + 1) {
        chain.push(values[j]);
        used[j] = true;
        last = values[j];
      }
    }

    chains.push(chain);
  }

  return chains;
}

function groupSinglesToPasche(singleChains) {
  const map = new Map();

  for (const chain of singleChains) {
    const value = chain[0]; // jede chain ist [x]
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(value);
  }

  return [...map.values()];
}

function getStagesOfSuccess(chains, criticalPasches) {

	const chainLengthTotal = chains.reduce((sum, chain) => sum + chain.length, 0);
	const stagesOfSuccess = chainLengthTotal - chains.length;
	
	if (stagesOfSuccess === 0) return 0;
	
	if(criticalPasches.some(p => p.length > stagesOfSuccess ))
	{
		return 0;
	}
	
	return stagesOfSuccess;
}

function getSuccessOutput(stagesOfSuccess) {

	switch (stagesOfSuccess){
		case 0:
			return "Patzer";
		case 1:
			return "Teilerfolg";
		case 2:
			return "Normaler Erfolg";
		case 3:
			return "Beeindruckender Erfolg";
		case 4:
			return "Überragender Erfolg";
		case 5:
			return "Epischer Erfolg";
		default:
			return "Well... Das sollte nicht möglich sein, aber du hast es geschafft! Glückwunsch... oder so. You broke the system!"
	}
}