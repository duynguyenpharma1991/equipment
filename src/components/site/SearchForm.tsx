import Form from "next/form";

/** GET search form for the search page. Focuses itself when there is no query yet. */
export function SearchForm({
  lang,
  term,
  label,
  placeholder,
}: {
  lang: string;
  term: string;
  label: string;
  placeholder: string;
}) {
  return (
    <Form action={`/${lang}/search`} className="search-box large" role="search">
      <input
        name="q"
        type="search"
        defaultValue={term}
        placeholder={placeholder}
        aria-label={label}
        maxLength={80}
        autoFocus={!term}
        enterKeyHint="search"
      />
      <button type="submit" aria-label={label}>
        ⌕
      </button>
    </Form>
  );
}
