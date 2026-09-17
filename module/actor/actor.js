console.log("Aera:Kai | actor.js wurde geladen");

export class Character extends Actor {

  /** 
   * Wird zuerst ausgeführt.
   * Hier initialisieren wir die Grundstruktur und setzen Defaults,
   * falls der Actor neu ist oder Felder fehlen.
   */
  prepareBaseData() {
    super.prepareBaseData();
	
	console.log("Aera:Kai | prepareBaseData() gestartet für:", this.name);
	console.log("Aera:Kai | Rohdaten vor Initialisierung:", foundry.utils.deepClone(this.system));

    const sys = this.system;

    // --- Attribute ---
    sys.attributes ??= {};
    sys.attributes.kr ??= 0;
    sys.attributes.zae ??= 0;
    sys.attributes.gw ??= 0;
    sys.attributes.ff ??= 0;
    sys.attributes.in ??= 0;
    sys.attributes.ch ??= 0;
    sys.attributes.vs ??= 0;

    // --- Ressourcen ---
    sys.resources ??= {};
    sys.resources.tp ??= { value: 1, max: 1 };
    sys.resources.wu ??= { value: 1, max: 1 };
    sys.resources.ak ??= { value: 1, max: 1 };
    sys.resources.kp ??= { value: 1, max: 1 };

    // --- Hintergrund ---
    sys.background ??= {};
    sys.background.pfad ??= "";
    sys.background.herkunft ??= "";
    sys.background.hobby ??= "";
    sys.background.markenzeichen ??= "";
    sys.background.merkmal ??= "";
	
	console.log("Aera:Kai | Daten nach Initialisierung:", foundry.utils.deepClone(this.system));
  }

  /**
   * Wird nach prepareBaseData ausgeführt.
   * Hier kannst du später abgeleitete Werte berechnen.
   */
  prepareDerivedData() {
    super.prepareDerivedData();
	console.log("Aera:Kai | prepareDerivedData() für:", this.name);
    const sys = this.system;

    // Beispiel: Abgeleitete Werte (später)
    // sys.resources.tp.max = sys.attributes.kr + sys.attributes.zae;
  }
}
