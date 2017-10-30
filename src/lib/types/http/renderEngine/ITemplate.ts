/*
Representation of a template file.
 */
 export default interface ITemplate {

   readonly content: string;

   load(callback: () => void): void;

 }
