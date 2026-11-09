#!/usr/bin/env python3
"""The words of a Studio note: a JSON head, a line of three dashes, then the body in a small Markdown.

    {"title": "...", "date": "2026-10-24", "beat": "models", ...}
    ---
    Body.

The body takes: ## and ### headings, paragraphs, - and 1. lists, > quotes, | tables |, ``` fenced code ```,
**bold**, *italic*, `code`, [words](https://...), and [1] for the note's first source (a link to it at the foot).
A fence marked chart holds JSON and draws a bar chart:

    ```chart
    {"title": "Seconds to first word", "unit": "s", "rows": [["Llama 3.3 70B", 2.1], ["GPT-OSS 120B", 6.4]],
     "note": "Median of 20 runs, 24 October 2026."}
    ```

read(path) -> (head, body_markdown); html(body, n_sources) -> HTML; words(body) -> word count.
"""
import html as _html
import json
import re

E = _html.escape


def read(path):
    text = open(path, encoding="utf-8").read()
    head, sep, body = text.partition("\n---\n")
    if not sep:
        raise ValueError("%s: no line of three dashes after the JSON head" % path)
    return json.loads(head), body.strip("\n") + "\n"


def words(body):
    body = re.sub(r"```.*?```", " ", body, flags=re.S)
    return len(re.findall(r"[A-Za-z0-9']+", body))


_CODE = re.compile(r"`([^`]+)`")
_LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)\s]+|/[^)\s]*)\)")
_REF = re.compile(r"\[(\d{1,2})\](?!\()")
_BOLD = re.compile(r"\*\*(.+?)\*\*")
_ITAL = re.compile(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])")


def inline(s, n_sources=0, keep=None):
    """Escape, then mark up. Code spans are set aside first so nothing inside them is touched; link text shares the
    same set-aside list, so a code span inside a link comes back whole."""
    keep = [] if keep is None else keep

    def stash(h):
        keep.append(h)
        return "\x00%d\x00" % (len(keep) - 1)
    s = _CODE.sub(lambda m: stash("<code>%s</code>" % E(m.group(1))), s)
    s = _LINK.sub(lambda m: stash('<a href="%s"%s>%s</a>' % (
        E(m.group(2)), ' rel="noopener"' if m.group(2).startswith("http") else "", inline(m.group(1), n_sources, keep))), s)

    def ref(m):
        n = int(m.group(1))
        if not 1 <= n <= n_sources:
            raise ValueError("[%d] names no source (the note has %d)" % (n, n_sources))
        return stash('<sup class="ref"><a href="#s%d" aria-label="source %d">%d</a></sup>' % (n, n, n))
    s = _REF.sub(ref, s)
    s = E(s, quote=False)
    s = _BOLD.sub(r"<strong>\1</strong>", s)
    s = _ITAL.sub(r"<em>\1</em>", s)
    return re.sub("\x00(\\d+)\x00", lambda m: keep[int(m.group(1))], s)


def M_plain(s):
    """A table heading as plain words, for the label a stacked cell shows on a phone."""
    return re.sub(r"[*`]|\[(\d{1,2})\](?!\()", "", _LINK.sub(r"\1", s)).strip()


def chart(spec):
    """A bar chart as a table: one row per bar, its length the value's share of the largest."""
    c = json.loads(spec)
    rows = c["rows"]
    top = c.get("max") or max(abs(float(v)) for _, v in rows) or 1
    unit = c.get("unit", "")
    lo_better = c.get("lower_is_better", False)
    body = "".join(
        '<tr><th scope="row">%s</th><td><span class="bar" style="--w:%.1f%%"></span><span class="v">%s%s</span></td></tr>' % (
            inline(str(label)), 100 * abs(float(v)) / top, E(("{:,}".format(v)) if isinstance(v, int) else str(v)), E(unit))
        for label, v in rows)
    cap = E(c.get("title", ""))
    if lo_better:
        cap += ' <span class="lo">· lower is better</span>'
    note = '<figcaption>%s</figcaption>' % inline(c["note"]) if c.get("note") else ""
    return '<figure class="chart"><table><caption>%s</caption><tbody>%s</tbody></table>%s</figure>' % (cap, body, note)


def html(body, n_sources=0):
    out, para, lines, i = [], [], body.split("\n"), 0

    def flush():
        if para:
            out.append("<p>%s</p>" % inline(" ".join(para), n_sources))
            para.clear()
    while i < len(lines):
        ln = lines[i]
        if ln.startswith("```"):
            flush()
            lang = ln[3:].strip()
            j = i + 1
            while j < len(lines) and not lines[j].startswith("```"):
                j += 1
            if j == len(lines):
                raise ValueError("code fence opened on line %d is never closed" % (i + 1))
            code = "\n".join(lines[i + 1:j])
            if lang == "chart":
                out.append(chart(code))
            else:
                out.append('<div class="code"><pre%s><code>%s</code></pre></div>' % (
                    ' data-lang="%s"' % E(lang) if lang else "", E(code)))
            i = j + 1
            continue
        m = re.match(r"(#{2,3}) (.+)", ln)
        if m:
            flush()
            lvl = len(m.group(1))
            slug = re.sub(r"[^a-z0-9]+", "-", m.group(2).lower()).strip("-")[:48]
            out.append('<h%d id="%s">%s</h%d>' % (lvl, slug, inline(m.group(2), n_sources), lvl))
            i += 1
            continue
        if re.match(r"\s*([-*]|\d+\.) ", ln):
            flush()
            ordered = bool(re.match(r"\s*\d+\.", ln))
            items = []
            while i < len(lines) and re.match(r"\s*([-*]|\d+\.) ", lines[i]):
                item = re.sub(r"^\s*([-*]|\d+\.) ", "", lines[i])
                i += 1
                while i < len(lines) and lines[i].startswith("  ") and lines[i].strip():
                    item += " " + lines[i].strip()
                    i += 1
                items.append("<li>%s</li>" % inline(item, n_sources))
            out.append("<%s>%s</%s>" % ("ol" if ordered else "ul", "".join(items), "ol" if ordered else "ul"))
            continue
        if ln.startswith(">"):
            flush()
            q = []
            while i < len(lines) and lines[i].startswith(">"):
                q.append(lines[i].lstrip("> ").rstrip())
                i += 1
            out.append("<blockquote><p>%s</p></blockquote>" % inline(" ".join(q), n_sources))
            continue
        if ln.startswith("|") and i + 1 < len(lines) and re.match(r"\|?\s*:?-{3,}", lines[i + 1]):
            flush()
            cells = lambda r: [c.strip() for c in r.strip().strip("|").split("|")]  # noqa: E731
            head = cells(ln)
            i += 2
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                rows.append(cells(lines[i]))
                i += 1
            out.append('<div class="tbl"><table><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (
                "".join('<th scope="col">%s</th>' % inline(h, n_sources) for h in head),
                "".join("<tr>%s</tr>" % "".join(
                    ('<th scope="row">%s</th>' % inline(c, n_sources)) if k == 0 else
                    ('<td data-h="%s">%s</td>' % (E(M_plain(head[k]) if k < len(head) else ""), inline(c, n_sources)))
                    for k, c in enumerate(r)) for r in rows)))
            continue
        if not ln.strip():
            flush()
            i += 1
            continue
        para.append(ln.strip())
        i += 1
    flush()
    return "\n".join(out)


def plain(body):
    """The body as one line of text, for a feed summary or a search snippet."""
    t = re.sub(r"```.*?```", " ", body, flags=re.S)
    t = _LINK.sub(r"\1", t)
    t = _REF.sub("", t)
    t = re.sub(r"[#>*`|]", " ", t)
    return re.sub(r"\s+", " ", t).strip()
