/**
 * Representation of a template file.
 */
 export default interface ITemplate {

   readonly fileName: string;

   readonly content: string;

   load(callback: (err: Error) => void): void;

 }
