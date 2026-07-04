/** Translation information shown in the About panel. */

export const GUIDE_CONTENT = [
  {
    title: "Purpose of this app",
    points: [
      "Read the Holy Bible (کتابِ مقدّس) in Urdu and English together, verse by verse — the Urdu Geo Version above and the World English Bible below.",
      "Seeing both translations side by side helps you understand the meaning of Scripture more deeply in whichever language you know best.",
      "Learners of Urdu or English also benefit: compare the same verse in both languages to grow your vocabulary while reading God's Word.",
    ],
  },
  {
    title: "How to read",
    points: [
      "From the home screen, choose a book from the Old Testament (پُرانا عہدنامہ) or New Testament (نیا عہدنامہ), then pick a chapter.",
      "Turn pages by swiping left or right, or tap the arrows at the screen edges. Reading continues smoothly into the next chapter and book.",
      "Tap the Aa button while reading to change the font size, margins, and Day, Sepia, or Night theme.",
    ],
  },
  {
    title: "Highlights and notes",
    points: [
      "Long-press any verse in the reader (or tap it) to open the highlight menu.",
      "Choose a highlight color — yellow, green, or blue. To attach a personal note, type the color followed by your note, for example: yellow: God's promise to me.",
      "All highlighted verses and notes are saved in your Notebook. Open it from the home screen to revisit them, jump back to the verse, or delete them one by one.",
    ],
  },
  {
    title: "Daily Reading Plan",
    points: [
      "A guided journey through Scripture based on the Book of Common Prayer lectionary — 814 daily readings.",
      "Each day gives you five passages: two Psalms, an Old Testament reading, a New Testament reading, and a Gospel reading.",
      "Tap any passage and the exact verses open in both Urdu and English. Mark the day complete when you finish to build your daily reading streak.",
      "You can restart the plan from Day 1 at any time using the restart button on the plan screen.",
    ],
  },
  {
    title: "Read offline",
    points: [
      "Scroll to the bottom of the home screen and tap Download full Bible to save all 66 books in both languages on your device (about 6 MB).",
      "After the one-time download, every chapter, your notebook, and the reading plan work completely without internet.",
      "If the download is interrupted, tap Resume and it continues from where it stopped.",
    ],
  },
];

export const ABOUT_CONTENT = {
  urdu: {
    title: "Urdu Geo Version",
    titleUrdu: "اردو جیو ورژن",
    year: "2019",
    license: "CC BY-NC-ND 4.0",
    points: [
      "Modern Urdu translation of the Holy Bible (کتابِ مقدّس), translated from the original Hebrew, Aramaic, and Greek.",
      "Aims to stay close to the source languages while using clear, contemporary Urdu.",
      "Reflects how Urdu is spoken today — both اللہ and خدا appear for God, following common usage among Urdu readers.",
      "Uses اللہ in line with long-standing Arabic Christian tradition and standard Arabic Bible translations; خدا reflects Persian-influenced usage on the subcontinent.",
      "Section headings are aids for reading and are not part of the inspired text.",
      "Copyright © 2019 Urdu Geo Version. Share with attribution; do not alter the Scripture text.",
    ],
    link: "https://urdugeoversion.com/en/about.html",
  },
  english: {
    title: "World English Bible (WEB)",
    year: "2006",
    license: "Public Domain",
    points: [
      "Modern English translation in the lineage of the American Standard Version (1901).",
      "Updated wording for readability while remaining a formal, word-for-word oriented translation.",
      "Translated from the same Hebrew and Greek source tradition used by major English Bibles.",
      "Public domain — free to use, share, and republish without restrictions.",
      "Maintained by the World English Bible project and widely used in open-source Bible apps.",
    ],
    link: "https://worldenglish.bible/",
  },
};
