export class Character extends Actor {
  static get metadata() {
    return {
      ...super.metadata,
      types: ["pc", "npc", "monster"]
    };
  }

  prepareData() {
    super.prepareData();
    const data = this.system;
  }
}
