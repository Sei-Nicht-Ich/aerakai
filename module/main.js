import { Character } from "./actor/actor.js";
import { CharacterSheet } from "./actor/actor-sheet.js";

console.log("Aera:Kai | main.js wurde geladen");

Hooks.once("init", () => {
  console.log("Aera:Kai | Initialisierung läuft");

  console.log("Aera:Kai | Actor Schema geladen:", CONFIG.Actor.schema);
  console.log("Aera:Kai | Item Schema geladen:", CONFIG.Item.schema);
  console.log("Actor Registry:", foundry.documents.Actor.registry);
	console.log("Item Registry:", foundry.documents.Item.registry);


  CONFIG.Actor.documentClass = Character;
  CONFIG.Item.documentClass = class extends Item {};

  foundry.documents.collections.Actors.registerSheet("aerakai", CharacterSheet, {
    types: ["pc", "npc", "monster"],
    makeDefault: true
  });
});
