"""Validate Urdu Geo + WEB alignment by book/chapter/verse."""
import json
from pathlib import Path

URDU = Path(r"C:\Users\SharoonGeorge\Projects\urdu-bible-data")
ENG = Path(r"C:\Users\SharoonGeorge\Projects\english-bible-data")

urdu_books = {b["id"]: b for b in json.loads((URDU / "books.json").read_text(encoding="utf-8"))}
eng_books = {b["id"]: b for b in json.loads((ENG / "books.json").read_text(encoding="utf-8"))}

chapter_mismatches = []
one_side = []

for book_id in range(1, 67):
    u_meta, e_meta = urdu_books[book_id], eng_books[book_id]
    assert u_meta["chapter_count"] == e_meta["chapter_count"], f"book {book_id} chapter count"
    for chapter in range(1, u_meta["chapter_count"] + 1):
        u = json.loads((URDU / "chapters" / str(book_id) / f"{chapter}.json").read_text(encoding="utf-8"))
        e = json.loads((ENG / "chapters" / str(book_id) / f"{chapter}.json").read_text(encoding="utf-8"))
        assert u["book"] == e["book"] == book_id
        assert u["chapter"] == e["chapter"] == chapter
        if u["verse_count"] != e["verse_count"]:
            chapter_mismatches.append((book_id, chapter, u["verse_count"], e["verse_count"]))
        u_set = {v["verse"] for v in u["verses"]}
        e_set = {v["verse"] for v in e["verses"]}
        for n in range(1, max(u["verse_count"], e["verse_count"]) + 1):
            if (n in u_set) != (n in e_set):
                one_side.append((book_id, chapter, n))

print("books_ok", 66)
print("chapter_verse_count_mismatches", len(chapter_mismatches))
print("verse_on_one_side_only", len(one_side))
print("sample_mismatches", chapter_mismatches[:5])
print("sample_one_side", one_side[:5])
