export class Utils {
  static async loadFile(link) {
    const response = await fetch(link);
    return await response.text();
  }
}