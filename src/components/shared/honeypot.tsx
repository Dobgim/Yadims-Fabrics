import { HONEYPOT_FIELD } from "@/lib/validations";

/**
 * A field a human never sees or fills. Bots that fill every input trip it, and
 * the server drops the submission (see the marketing actions).
 *
 * Hidden the accessible way: pushed off-screen rather than `display:none`, so
 * the label association stays valid, with `tabIndex={-1}` and `aria-hidden` so
 * keyboard and screen-reader users skip past it, and autocomplete off so a
 * password manager does not helpfully fill it in.
 */
export function Honeypot() {
  return (
    <div aria-hidden className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
      <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
      <input
        type="text"
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}
