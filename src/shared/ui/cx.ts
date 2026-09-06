/** Joins truthy class names — a tiny classnames helper so components can merge CSS-Module
 *  classes with optional caller-supplied ones without pulling in a dependency. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
