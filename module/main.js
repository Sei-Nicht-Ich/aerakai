import { Character } from "./actor/actor.js";
import { CharacterSheet } from "./actor/actor-sheet.js";

Hooks.once("init", () => {
  console.log("Aera:Kai | Initialisierung läuft");

  CONFIG.Actor.documentClass = Character;
  CONFIG.Item.documentClass = class extends Item {};
  
    Actors.registerSheet("aerakai", CharacterSheet, {
    types: ["pc", "npc", "monster"],
    makeDefault: true
  });
});